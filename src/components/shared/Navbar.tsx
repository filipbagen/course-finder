import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ClientNavbar from './ClientNavbar';

export async function Navbar() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return <ClientNavbar user={user} />;
}
