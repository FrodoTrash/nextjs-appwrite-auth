"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgotPassword } from "@/lib/actions-auth";

// 1. Define the Zod schema for validation
const passwordResetSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
});

// 2. Infer the type from the schema for type safety
type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

export default function ForgotPasswordClientPage() {
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
    setStatusMessage(""); // Clear previous messages
    setIsSuccess(false);

    const result = await forgotPassword(data.email);

    if (result.success) {
      setIsSuccess(true);
      setStatusMessage(
        "If an account with that email exists, a password reset link has been sent."
      );
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
            Forgot Password?
          </h1>
          <p className="mb-6 text-center text-gray-600">
            Enter your email address to receive a password reset link.
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
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
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
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <div className="flex flex-col space-y-2">
              <Link
                href="/auth/login"
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
