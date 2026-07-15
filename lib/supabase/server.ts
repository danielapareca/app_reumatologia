import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieItem = { name: string; value: string; options?: CookieOptions };

// Cliente Supabase para uso no servidor (Server Components, Route Handlers).
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // O método setAll pode falhar em Server Components (somente leitura).
            // O middleware cuida de renovar a sessão, então é seguro ignorar.
          }
        },
      },
    }
  );
}
