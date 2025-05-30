import { createClient } from '@/lib/supabase/server';
import ClientNavbar from './ClientNavbar';

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <ClientNavbar user={user} />;
}