import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  if (user) {
    if (user.role === "super_admin" || user.role === "clinic_admin") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  } else {
    redirect("/auth/login");
  }
}
