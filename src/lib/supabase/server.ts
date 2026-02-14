import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  // Need to use async/await pattern for compatibility with your Next.js version
  const cookieStore = await cookies();

  // Create the client with a compatible pattern
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll: async (cookies: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try {
            cookies.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // This error is expected in Server Components
            // The cookies will still be set client-side
          }
        },
      },
    }
  );
};
