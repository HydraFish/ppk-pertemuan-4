"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const THEME_COOKIE = "duitku_theme";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function setTheme(formData: FormData) {
  const value = formData.get("theme");
  if (value !== "light" && value !== "dark") {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE, value, {
    path: "/",
    maxAge: THIRTY_DAYS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const referer = (await headers()).get("referer");
  redirect(referer ?? "/dashboard");
}
