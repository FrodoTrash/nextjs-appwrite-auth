import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-actions";
import ForgotPasswordClientPage from "@/components/ForgotPassword";

// The server component acts as a gatekeeper.
export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();

  // If the user is already authenticated, redirect them away from the login page.
  if (user) {
    redirect("/account");
  }

  // If not authenticated, render the client component with the login form.
  return <ForgotPasswordClientPage />;
}
