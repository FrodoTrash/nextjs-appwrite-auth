import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-actions";
import ResetPasswordClientPage from "@/components/ResetPassword";

type ResetPasswordPageProps = {
  // `searchParams` is a Next.js feature that automatically
  // provides URL query parameters as props to a server component.
  searchParams: {
    secret?: string;
    userId?: string;
  };
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const user = await getCurrentUser();

  // If the user is already authenticated, they don't need to reset their password.
  // Redirect them to their account page.
  if (user) {
    redirect("/account");
  }

  const { secret, userId } = searchParams;

  // Ensure that the required parameters are present in the URL.
  // If not, it means the user accessed the page incorrectly.
  if (!secret || !userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="mb-4 text-3xl font-bold text-red-600">Invalid Link</h1>
          <p className="text-gray-600">
            This password reset link is invalid or has expired. Please return to
            the forgot password page to request a new one.
          </p>
          <div className="mt-6">
            <a
              href="/forgot-password"
              className="inline-block rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Go to Forgot Password
            </a>
          </div>
        </div>
      </main>
    );
  }

  // If the parameters are present, render the client component and pass them down.
  return <ResetPasswordClientPage secret={secret} userId={userId} />;
}
