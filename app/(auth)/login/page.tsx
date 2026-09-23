import Link from "next/link";
import { login } from "@/lib/actions/auth";
import { authErrorMessage, authNoticeMessage } from "@/lib/authMessages";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; redirectTo?: string }>;
}) {
  const params = await searchParams;
  const error = authErrorMessage(params.error);
  const notice = authNoticeMessage(params.notice);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Masuk ke DUITku</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Kelola pemasukan dan pengeluaranmu.
          </p>
        </div>

        {notice && (
          <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <form action={login} className="space-y-4">
          <input type="hidden" name="redirectTo" value={params.redirectTo ?? "/dashboard"} />
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Masuk
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-foreground underline">
            Daftar
          </Link>
        </p>
      </div>
    </main>
  );
}
