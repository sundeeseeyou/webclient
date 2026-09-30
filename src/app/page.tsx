import { redirect } from "next/navigation";
import { getSessionUser, homePathFor } from "@/lib/rbac";

export default async function HomePage() {
  const user = await getSessionUser();
  redirect(user ? homePathFor(user.role) : "/login");
}
