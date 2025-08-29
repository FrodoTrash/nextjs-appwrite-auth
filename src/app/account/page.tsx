import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-actions";
import AccountClientPage from "@/components/Account";

// This is a Server Component, so there is no "use client" directive.
// It runs entirely on the server.
export default async function AccountPage() {
  // 1. Fetch user data on the server
  // This is the most efficient way to get the user's session
  // since it's a direct database/cookie check on the server.
  const user = await getCurrentUser();

  // 2. Perform the authentication check
  // If the user is not found, redirect immediately on the server.
  // This prevents the client-side AccountPage from ever loading or rendering.
  if (!user) {
    redirect("/login");
  }

  // 3. Pass the initial data to the Client Component
  // If the user exists, we pass the user object as a prop to the
  // client component for rendering.
  return <AccountClientPage initialUser={user} />;
}
