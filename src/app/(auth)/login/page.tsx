import { redirect } from "next/navigation";
import { LoginForm } from "@/components/shared/login-form";
import { Wordmark } from "@/components/shared/wordmark";
import { authText } from "@/lib/labels";
import { getSessionUser, homePathFor } from "@/lib/rbac";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(homePathFor(user.role));

  return (
    <main className="flex min-h-screen bg-card">
      <section className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-1/2">
        <Wordmark />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold">{authText.title}</h1>
          <p className="mt-2 text-muted-foreground">{authText.subtitle}</p>
          <LoginForm />
        </div>
        <p className="text-xs text-muted-foreground">Boowat.com</p>
      </section>
      <section className="hidden w-1/2 flex-col justify-between bg-primary px-12 py-8 lg:flex">
        <Wordmark onPrimary />
        <div className="max-w-md">
          <span className="mb-6 block h-1 w-12 rounded-full bg-secondary" />
          <h2 className="text-2xl font-semibold text-primary-foreground">{authText.panelTitle}</h2>
          <p className="mt-3 text-base text-primary-foreground/75">{authText.panelBody}</p>
        </div>
        <p className="text-xs text-primary-foreground/60">Boowat.com</p>
      </section>
    </main>
  );
}
