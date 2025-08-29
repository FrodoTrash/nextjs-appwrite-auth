import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions-auth";
import Link from "next/link";
import { User, LogIn, UserPlus } from "lucide-react";

export default async function RootPage() {
  const user = await getCurrentUser();

  // If the user is authenticated, redirect them to their account page.
  if (user) {
    redirect("/account");
  }

  // If the user is not authenticated, render a static landing page
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg">
            <User size={64} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Welcome to the App
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Start your journey by signing in or creating a new account.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <Link
            href="/auth/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <LogIn size={20} />
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-3 text-lg font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <UserPlus size={20} />
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
