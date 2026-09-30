import { PiArticle } from "react-icons/pi";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";

type PublishedArticle = { id: string; title: string; url: string | null; publishedAt: Date | null };

export function PublishedArticleList({ articles }: { articles: PublishedArticle[] }) {
  if (articles.length === 0) {
    return (
      <EmptyState
        icon={PiArticle}
        title="Belum ada artikel yang terbit"
        description="Artikel baru di website Anda akan muncul di sini."
      />
    );
  }

  return (
    <ul className="divide-y">
      {articles.map((article) => (
        <li key={article.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          {article.url ? (
            <a href={article.url} target="_blank" rel="noreferrer" className="min-w-0 font-medium wrap-break-word hover:text-primary hover:underline">
              {article.title}
            </a>
          ) : (
            <span className="min-w-0 font-medium wrap-break-word">{article.title}</span>
          )}
          <span className="shrink-0 text-xs text-muted-foreground">
            {article.publishedAt ? formatDate(article.publishedAt) : "Tanggal belum diisi"}
          </span>
        </li>
      ))}
    </ul>
  );
}
