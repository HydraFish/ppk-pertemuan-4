import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DUITku",
  description: "Pencatat keuangan pribadi untuk mahasiswa.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = (await cookies()).get("duitku_theme")?.value;

  return (
    <html
      lang="id"
      data-theme={theme === "dark" ? "dark" : "light"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
