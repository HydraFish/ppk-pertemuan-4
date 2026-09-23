import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import { setTheme } from "@/lib/actions/theme";

export function AppNav({
  email,
  theme,
}: {
  email: string;
  theme: "light" | "dark";
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-8">
      <nav className="flex items-center gap-4 text-sm font-medium">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/transactions/new">Tambah Transaksi</Link>
      </nav>
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden text-zinc-500 dark:text-zinc-400 sm:inline">{email}</span>
        <form action={setTheme}>
          <input type="hidden" name="theme" value={theme === "dark" ? "light" : "dark"} />
          <button
            type="submit"
            aria-label="Ganti tema"
            className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700"
          >
            {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          </button>
        </form>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700"
          >
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
