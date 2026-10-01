// Klien HTTP sederhana dengan cookie session, dipakai untuk menyiapkan dan memeriksa data uji lewat API.
export async function apiSession(baseUrl, email, password) {
  const jar = new Map();
  const store = (res) => {
    for (const cookie of res.headers.getSetCookie()) {
      const [pair] = cookie.split(";");
      const index = pair.indexOf("=");
      jar.set(pair.slice(0, index), pair.slice(index + 1));
    }
  };
  const cookieHeader = () => [...jar].map(([key, value]) => `${key}=${value}`).join("; ");

  const csrf = await fetch(`${baseUrl}/api/auth/csrf`);
  store(csrf);
  const { csrfToken } = await csrf.json();
  store(
    await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: "POST",
      redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded", cookie: cookieHeader() },
      body: new URLSearchParams({ csrfToken, email, password }),
    }),
  );

  return async function get(path) {
    const res = await fetch(baseUrl + path, { headers: { cookie: cookieHeader() } });
    const type = res.headers.get("content-type") ?? "";
    return { status: res.status, body: type.includes("json") ? await res.json() : null };
  };
}
