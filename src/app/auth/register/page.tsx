import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions-auth"; // Assuming this function gets the user on the server
import RegisterClientPage from "@/components/Register";

// This is a Server Component that checks if the user is already authenticated.
export default async function RegisterPage() {
  const user = await getCurrentUser();

  // If the user is found, redirect them immediately to the account page.
  if (user) {
    redirect("/account");
  }

  // If no user is found, render the client component with the registration form.
  return <RegisterClientPage />;
}
