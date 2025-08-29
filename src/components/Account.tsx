"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { signOut } from "@/lib/auth-actions";
import { User, LogOut } from "lucide-react";

// A simple loading skeleton component
const AccountSkeleton = () => (
  <div className="w-full max-w-2xl animate-pulse space-y-8">
    <div className="flex flex-col items-center">
      <div className="h-24 w-24 rounded-full bg-gray-300"></div>
      <div className="mt-4 h-8 w-48 rounded bg-gray-300"></div>
      <div className="mt-2 h-6 w-32 rounded bg-gray-300"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 w-full rounded bg-gray-300"></div>
      <div className="h-4 w-full rounded bg-gray-300"></div>
      <div className="h-4 w-3/4 rounded bg-gray-300"></div>
    </div>
  </div>
);

type AccountClientPageProps = {
  initialUser: any;
};

export default function AccountClientPage({
  initialUser,
}: AccountClientPageProps) {
  const router = useRouter();

  // We don't need useQuery for the initial fetch anymore since the
  // Server Component already provides the initial data.
  // This hook is now primarily for caching and re-fetching.
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => initialUser, // Use the initial data
    initialData: initialUser,
    staleTime: 5 * 60 * 1000,
  });

  // Handle sign-out with useMutation for better UX
  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // On successful sign-out, React Query will invalidate the cache
      // and the Server Component will handle the redirect on the next request.
      router.push("/login");
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-lg">
        {/* Profile Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <User size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.name}!
          </h1>
          {user.username && (
            <p className="text-lg text-gray-500">@{user.username}</p>
          )}
        </div>

        {/* Account Information */}
        <div className="mb-8 space-y-3 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Account Information
          </h2>
          <div className="text-gray-700">
            <strong>Name:</strong> {user.name}
          </div>
          {user.username && (
            <div className="text-gray-700">
              <strong>Username:</strong> {user.username}
            </div>
          )}
          <div className="text-gray-700">
            <strong>Email:</strong> {user.email}
          </div>
          <div className="text-gray-700">
            <strong>Account Created:</strong>{" "}
            {new Date(user.$createdAt).toLocaleDateString()}
          </div>
          <div className="text-gray-700">
            <strong>Email Verified:</strong>{" "}
            <span
              className={
                user.emailVerification
                  ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
                  : "rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
              }
            >
              {user.emailVerification ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="text-center">
          <button
            onClick={() => signOutMutation.mutate()}
            disabled={signOutMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-6 py-2 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signOutMutation.isPending ? (
              "Signing Out..."
            ) : (
              <>
                <LogOut size={16} />
                Sign Out
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
