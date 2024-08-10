import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import ClientNavbar from './ClientNavbar';

export async function Navbar() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return <ClientNavbar user={user} />;
}
