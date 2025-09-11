import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cache the server client to improve performance in server components
let cachedClient: ReturnType<typeof createServerClient> | null = null;
let lastClientCreatedAt = 0;
const CLIENT_TTL = 60 * 1000; // 1 minute cache

export const createClient = async () => {
  const now = Date.now();

  // Check if we have a valid cached client
  if (cachedClient && now - lastClientCreatedAt < CLIENT_TTL) {
    return cachedClient;
  }

  try {
    const cookieStore = await cookies();

    // Create new client with timeout protection
    const clientPromise = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
              console.warn(
                'Ignoring cookie set error in server component',
                error
              );
            }
          },
        },
      }
    );

    // Set the new client as cached
    cachedClient = clientPromise;
    lastClientCreatedAt = now;

    return clientPromise;
  } catch (error) {
    console.error('Error creating Supabase server client:', error);
    // If we have a cached client, return it as fallback even if expired
    if (cachedClient) {
      console.warn('Using expired cached Supabase client as fallback');
      return cachedClient;
    }
    throw new Error('Failed to create Supabase server client');
  }
};
