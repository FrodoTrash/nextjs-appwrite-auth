"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  signOut,
  changeEmail,
  changePassword,
  getCurrentUser,
} from "@/lib/actions-auth";
import { User, LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

// Define the validation schemas for both forms
const changeEmailSchema = z.object({
  newEmail: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password is required." }),
});

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters long." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// A simple sign-out button that uses a server action
const SignOutButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-6 py-2 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        "Signing Out..."
      ) : (
        <>
          <LogOut size={16} />
          Sign Out
        </>
      )}
    </button>
  );
};

// Main component that handles the different views
type AccountTabsClientPageProps = {
  initialUser: any;
};

export default function AccountTabsClientPage({
  initialUser,
}: AccountTabsClientPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("account");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      // This is the correct way to re-fetch the user data from the server.
      // We assume a `getCurrentUser` server action exists to get the latest info.
      const freshUser = await getCurrentUser();
      return freshUser;
    },
    initialData: initialUser,
    staleTime: 5 * 60 * 1000,
  });

  // Change Email Form state and handler
  const [emailServerError, setEmailServerError] = useState("");
  const [emailSuccessMessage, setEmailSuccessMessage] = useState("");
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors, isSubmitting: isSubmittingEmail },
    reset: resetEmailForm,
  } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
  });

  const onEmailSubmit: SubmitHandler<ChangeEmailFormData> = async (data) => {
    setEmailServerError("");
    setEmailSuccessMessage("");

    const result = await changeEmail(data.newEmail, data.password);
    if (result.success) {
      setEmailSuccessMessage("Your email has been successfully updated.");
      resetEmailForm();
      // Invalidate the query to trigger a re-fetch of user data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    } else {
      setEmailServerError(
        result.error || "An error occurred. Please try again."
      );
    }
  };

  // Change Password Form state and handler
  const [passwordServerError, setPasswordServerError] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onPasswordSubmit: SubmitHandler<ChangePasswordFormData> = async (
    data
  ) => {
    setPasswordServerError("");
    setPasswordSuccessMessage("");

    const result = await changePassword(data.currentPassword, data.newPassword);
    if (result.success) {
      setPasswordSuccessMessage("Your password has been successfully updated.");
      resetPasswordForm();
    } else {
      setPasswordServerError(
        result.error || "An error occurred. Please try again."
      );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <>
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
              <form action={signOut}>
                <SignOutButton />
              </form>
            </div>
          </>
        );
      case "change-email":
        return (
          <form
            onSubmit={handleSubmitEmail(onEmailSubmit)}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center mb-6">
              Change Email
            </h2>
            {emailServerError && (
              <div
                className="rounded-md bg-red-50 p-4 text-sm text-red-700"
                role="alert"
              >
                {emailServerError}
              </div>
            )}
            {emailSuccessMessage && (
              <div
                className="rounded-md bg-green-50 p-4 text-sm text-green-700"
                role="alert"
              >
                {emailSuccessMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="newEmail"
                className="block text-sm font-medium text-gray-700"
              >
                New Email Address
              </label>
              <input
                id="newEmail"
                type="email"
                autoComplete="email"
                {...registerEmail("newEmail")}
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
              {emailErrors.newEmail && (
                <p className="mt-2 text-sm text-red-600">
                  {emailErrors.newEmail.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...registerEmail("password")}
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
              {emailErrors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {emailErrors.password.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmittingEmail}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmittingEmail ? "Updating..." : "Update Email"}
              </button>
            </div>
          </form>
        );
      case "change-password":
        return (
          <form
            onSubmit={handleSubmitPassword(onPasswordSubmit)}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center mb-6">
              Change Password
            </h2>
            {passwordServerError && (
              <div
                className="rounded-md bg-red-50 p-4 text-sm text-red-700"
                role="alert"
              >
                {passwordServerError}
              </div>
            )}
            {passwordSuccessMessage && (
              <div
                className="rounded-md bg-green-50 p-4 text-sm text-green-700"
                role="alert"
              >
                {passwordSuccessMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...registerPassword("currentPassword")}
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...registerPassword("newPassword")}
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
              {passwordErrors.newPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...registerPassword("confirmPassword")}
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmittingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

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

        {/* Tabs for navigation */}
        <div className="mb-8 flex justify-center space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("account")}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "account"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Account Details
          </button>
          <button
            onClick={() => setActiveTab("change-email")}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "change-email"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Change Email
          </button>
          <button
            onClick={() => setActiveTab("change-password")}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "change-password"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Render the active content */}
        {renderContent()}
      </div>
    </main>
  );
}
