import { redirect } from "next/navigation";
import { LoginForm } from "@/components/shared/login-form";
import { Wordmark } from "@/components/shared/wordmark";
import { authText } from "@/lib/labels";
import { getSessionUser, homePathFor } from "@/lib/rbac";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(homePathFor(user.role));

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-md border bg-card p-6">
        <Wordmark />
        <h1 className="mt-4 text-base font-medium">{authText.title}</h1>
        <LoginForm />
      </div>
    </main>
  );
}
