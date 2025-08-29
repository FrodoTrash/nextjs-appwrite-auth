"use server";

import { createAdminClient, createSessionClient } from "./appwrite-server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ID } from "node-appwrite";

export async function signUp(
  email: string,
  password: string,
  username: string
) {
  const { account } = await createAdminClient();
  console.log("Signing up user:", { username, email, password });
  try {
    // Create the user account
    await account.create({
      userId: ID.unique(),
      email,
      password,
      name: username,
    });

    // Create session
    const session = await account.createEmailPasswordSession({
      email: email,
      password: password,
    });

    const cookieStore = await cookies();
    cookieStore.set(
      process.env.NEXT_PUBLIC_COOKIE_NAME || "_session",
      session.secret,
      {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Sign-up failed:", error); //debug
    return {
      success: false,
      error: error.message || "An unknown error occurred during registration.",
    };
  }
}

export async function signIn(email: string, password: string) {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    const cookieStore = await cookies();
    cookieStore.set(
      process.env.NEXT_PUBLIC_COOKIE_NAME || "_session",
      session.secret,
      {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      }
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  const { account } = await createSessionClient();

  try {
    const cookieStore = await cookies();
    cookieStore.delete(process.env.NEXT_PUBLIC_COOKIE_NAME || "_session");
    await account.deleteSessions();
  } catch (error) {
    // Handle error silently
    console.error("Error during sign out:", error);
  }

  redirect("/");
}

export async function getCurrentUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    return user;
  } catch (error) {
    return null;
  }
}

export async function forgotPassword(email: string) {
  try {
    // Use client-side account for recovery (this needs to be done client-side)
    const { account } = await import("./appwrite-client");

    // Use your actual domain URL for password recovery
    const recoveryUrl =
      process.env.NODE_ENV === "production"
        ? "https://yourdomain.com/reset-password" // Replace with your production domain
        : "http://localhost:3000/reset-password";

    await account.createRecovery({ email, url: recoveryUrl });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetPassword(
  password: string,
  secret: string,
  userId: string
) {
  try {
    const { account } = await createAdminClient();

    await account.updateRecovery({
      password,
      secret,
      userId,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function changePassword(oldPassword: string, newPassword: string) {
  try {
    const { account } = await createSessionClient();

    await account.updatePassword({ password: newPassword, oldPassword });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function changeEmail(newEmail: string, password: string) {
  try {
    const { account } = await createSessionClient();

    await account.updateEmail({
      email: newEmail,
      password,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
