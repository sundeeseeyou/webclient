import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));

// Session diganti tiruan agar aturan akses bisa diuji tanpa login sungguhan.
vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));

const { clientScope, getSessionUser, homePathFor, requireAdmin, requireApiUser, requireClient } = await import("@/lib/rbac");

const adminSession = { user: { id: "u-admin", name: "Dimas", email: "admin@boowat.com", role: "ADMIN", clientId: null } };
const clientSession = { user: { id: "u-klien", name: "Ayu", email: "klien1@contoh.com", role: "CLIENT", clientId: "c-1" } };

async function errorBody(response: unknown) {
  expect(response).toBeInstanceOf(NextResponse);
  const res = response as NextResponse;
  return { status: res.status, body: (await res.json()) as { data: null; error: { message: string } } };
}

beforeEach(() => {
  authMock.mockReset();
});

describe("homePathFor", () => {
  it("admin ke /admin, klien ke /portal", () => {
    expect(homePathFor("ADMIN")).toBe("/admin");
    expect(homePathFor("CLIENT")).toBe("/portal");
  });
});

describe("getSessionUser", () => {
  it("null bila belum login", async () => {
    authMock.mockResolvedValue(null);
    expect(await getSessionUser()).toBeNull();
  });

  it("admin selalu tanpa clientId", async () => {
    authMock.mockResolvedValue(adminSession);
    expect(await getSessionUser()).toEqual({ id: "u-admin", name: "Dimas", email: "admin@boowat.com", role: "ADMIN", clientId: null });
  });

  it("klien membawa clientId dari session", async () => {
    authMock.mockResolvedValue(clientSession);
    expect(await getSessionUser()).toMatchObject({ role: "CLIENT", clientId: "c-1" });
  });

  it("klien tanpa clientId dianggap tidak sah", async () => {
    authMock.mockResolvedValue({ user: { ...clientSession.user, clientId: null } });
    expect(await getSessionUser()).toBeNull();
  });
});

describe("requireAdmin dan requireClient (halaman)", () => {
  it("belum login diarahkan ke /login", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
    await expect(requireClient()).rejects.toThrow("REDIRECT:/login");
  });

  it("klien yang membuka halaman admin diarahkan ke /portal (BB-03)", async () => {
    authMock.mockResolvedValue(clientSession);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/portal");
  });

  it("admin yang membuka portal klien diarahkan ke /admin", async () => {
    authMock.mockResolvedValue(adminSession);
    await expect(requireClient()).rejects.toThrow("REDIRECT:/admin");
  });

  it("role yang sesuai mendapat data user", async () => {
    authMock.mockResolvedValue(adminSession);
    await expect(requireAdmin()).resolves.toMatchObject({ role: "ADMIN" });
    authMock.mockResolvedValue(clientSession);
    await expect(requireClient()).resolves.toMatchObject({ role: "CLIENT", clientId: "c-1" });
  });
});

describe("requireApiUser (route handler)", () => {
  it("401 bila belum login", async () => {
    authMock.mockResolvedValue(null);
    const { status, body } = await errorBody(await requireApiUser());
    expect(status).toBe(401);
    expect(body.data).toBeNull();
    expect(body.error.message).toMatch(/masuk kembali/);
  });

  it("403 bila role tidak sesuai", async () => {
    authMock.mockResolvedValue(clientSession);
    const { status } = await errorBody(await requireApiUser("ADMIN"));
    expect(status).toBe(403);
  });

  it("mengembalikan user bila role sesuai atau tidak dibatasi", async () => {
    authMock.mockResolvedValue(clientSession);
    await expect(requireApiUser("CLIENT")).resolves.toMatchObject({ role: "CLIENT" });
    await expect(requireApiUser()).resolves.toMatchObject({ role: "CLIENT" });
  });
});

describe("clientScope", () => {
  it("klien selalu dibatasi clientId dari session, bukan dari URL (BB-04)", () => {
    expect(clientScope({ id: "u", name: "Ayu", email: "a@b.c", role: "CLIENT", clientId: "c-1" })).toEqual({ clientId: "c-1" });
  });

  it("admin tidak dibatasi", () => {
    expect(clientScope({ id: "u", name: "Dimas", email: "a@b.c", role: "ADMIN", clientId: null })).toEqual({});
  });
});
