"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPassword } from "@/lib/auth-actions";

type ResetPasswordClientPageProps = {
  secret: string;
  userId: string;
};

// 1. Define the Zod schema for validation, including a password confirmation check.
const passwordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // The error will be associated with this field
  });

// 2. Infer the type from the schema for type safety
type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

export default function ResetPasswordClientPage({
  secret,
  userId,
}: ResetPasswordClientPageProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // 3. Set up React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  // 4. Handle form submission
  const onSubmit: SubmitHandler<PasswordResetFormData> = async (data) => {
    setStatusMessage("");
    setIsSuccess(false);

    const result = await resetPassword(data.password, secret, userId);

    if (result.success) {
      setIsSuccess(true);
      setStatusMessage("Password updated successfully. You can now sign in.");
    } else {
      setIsSuccess(false);
      setStatusMessage(result.error || "An error occurred. Please try again.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
            Reset Password
          </h1>
          <p className="mb-6 text-center text-gray-600">
            Enter your new password below.
          </p>

          {/* Display status messages */}
          {statusMessage && (
            <div
              className={`mb-4 rounded-md p-4 text-sm ${
                isSuccess
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
              role="alert"
            >
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
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
                {...register("confirmPassword")}
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <div className="flex flex-col space-y-2">
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
