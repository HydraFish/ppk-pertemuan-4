import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/supabase/dal";
import { getUserTransactions } from "@/lib/transactions";
import { AppNav } from "@/components/AppNav";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  const theme = (await cookies()).get("duitku_theme")?.value === "dark" ? "dark" : "light";
  const initialTransactions = await getUserTransactions(user.id);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppNav email={user.email ?? ""} theme={theme} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-8 sm:px-8">
        <DashboardClient initialTransactions={initialTransactions} />
      </main>
    </div>
  );
}
