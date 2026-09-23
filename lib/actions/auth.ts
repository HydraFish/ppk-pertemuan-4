"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeRedirectTarget(formData: FormData, fallback: string) {
  const raw = String(formData.get("redirectTo") ?? "");
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectTarget(formData, "/dashboard");

  if (!email || !password) {
    redirect(`/login?error=missing_fields`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=invalid_credentials`);
  }

  redirect(redirectTo);
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password) {
    redirect(`/register?error=missing_fields`);
  }
  if (password.length < 8) {
    redirect(`/register?error=weak_password`);
  }
  if (password !== confirmPassword) {
    redirect(`/register?error=password_mismatch`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.code === "user_already_exists") {
      redirect(`/register?error=email_taken`);
    }
    redirect(`/register?error=signup_failed`);
  }

  // If email confirmation is off, Supabase returns a session immediately.
  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/login?notice=check_email");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
