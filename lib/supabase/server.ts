import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Components can't write cookies. When called from one, `setAll`
// throws and is safely ignored because the proxy already refreshes the
// session cookie on every request.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component; ignore
          }
        },
      },
    },
  );
}
