import { z } from "zod";
import { prisma } from "@/lib/prisma";

const REQUEST_TIMEOUT_MS = 10_000;

export const WORDPRESS_FETCH_FAILED = "Tidak dapat mengambil artikel dari WordPress. Periksa alamat API.";
export const WORDPRESS_TIMEOUT = "WordPress tidak merespons dalam 10 detik. Coba lagi beberapa saat lagi.";

export class WordPressSyncError extends Error {}

const postsSchema = z.array(
  z.object({
    id: z.number(),
    title: z.object({ rendered: z.string() }),
    link: z.string(),
    date: z.string(),
  }),
);

type WordPressPost = z.infer<typeof postsSchema>[number];

const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

function fromCodePoint(code: number, fallback: string): string {
  return Number.isInteger(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : fallback;
}

// Judul dari WordPress berupa HTML ("Kopi &#8211; Gayo"), jadi tag dibuang dan entity diubah ke karakter biasa.
export function decodeHtmlTitle(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (match, hex: string) => fromCodePoint(parseInt(hex, 16), match))
    .replace(/&#(\d+);/g, (match, code: string) => fromCodePoint(Number(code), match))
    .replace(/&([a-z]+);/gi, (match, name: string) => namedEntities[name.toLowerCase()] ?? match)
    .trim();
}

// Kolom `date` WordPress memakai zona waktu situs tanpa offset; situs klien diasumsikan berzona WIB.
function parsePostDate(value: string): Date | null {
  const date = new Date(`${value.slice(0, 19)}+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function fetchWordPressPosts(apiUrl: string): Promise<WordPressPost[]> {
  const url = `${apiUrl.replace(/\/+$/, "")}/wp/v2/posts?per_page=100&_fields=id,title,link,date`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    throw new WordPressSyncError(timedOut ? WORDPRESS_TIMEOUT : WORDPRESS_FETCH_FAILED);
  }
  if (!response.ok) throw new WordPressSyncError(WORDPRESS_FETCH_FAILED);

  const json: unknown = await response.json().catch(() => null);
  const posts = postsSchema.safeParse(json);
  if (!posts.success) throw new WordPressSyncError(WORDPRESS_FETCH_FAILED);
  return posts.data;
}

// Upsert berdasarkan (websiteId, externalId): sinkron ulang memperbarui artikel yang sama, bukan menduplikasi.
export async function syncWordPressArticles(websiteId: string, apiUrl: string): Promise<number> {
  const posts = await fetchWordPressPosts(apiUrl);
  await prisma.$transaction(
    posts.map((post) => {
      const data = {
        title: decodeHtmlTitle(post.title.rendered) || "(Tanpa judul)",
        url: post.link || null,
        publishedAt: parsePostDate(post.date),
        status: "PUBLISHED" as const,
        source: "WORDPRESS" as const,
      };
      return prisma.article.upsert({
        where: { websiteId_externalId: { websiteId, externalId: String(post.id) } },
        create: { websiteId, externalId: String(post.id), ...data },
        update: data,
      });
    }),
  );
  return posts.length;
}
