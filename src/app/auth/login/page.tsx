import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-actions"; // Assuming this function gets the user on the server
import LoginClientPage from "@/components/Login";

// This is a Server Component that runs on the server.
// It checks if the user is already authenticated before rendering anything.
export default async function LoginPage() {
  // Check for the user session on the server.
  const user = await getCurrentUser();

  // If the user is found, redirect them immediately to the account page.
  // This redirect happens on the server before any client-side JavaScript is loaded.
  if (user) {
    redirect("/account");
  }

  // If no user is found, render the Client Component that contains the login form.
  return <LoginClientPage />;
}
