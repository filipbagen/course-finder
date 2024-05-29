import Link from 'next/link';

// kinde
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

// shadcn
import { Button } from '@/components/ui/button';
import { MaxWidthWrapper } from './MaxWidthWrapper';

// components
import { UserNav } from './UserNav';

export async function Navbar() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <nav className="mb-8 flex justify-between items-center sticky h-16 inset-x-0 top-0 z-30 w-full border-b border-gray-200 dark:border-black bg-white/75 dark:bg-gray-950/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex items-center justify-between">
          <Link href="/">
            <h4 className="font-semibold">🧭 Course Finder</h4>
          </Link>

          <div className="flex items-center gap-x-5">
            {(await isAuthenticated()) ? (
              <div className="flex items-center gap-x-5">
                {/* <Button>
                  <Link href="/dashboard">Dashboard</Link>
                </Button> */}

                <Button variant={'ghost'}>
                  <Link href="/dashboard/schedule">Schema</Link>
                </Button>

                <Button variant={'ghost'}>
                  <Link href="/dashboard/social">Användare</Link>
                </Button>

                <UserNav
                  email={user?.email as string}
                  image={user?.picture as string}
                  name={user?.given_name as string}
                />
              </div>
            ) : (
              <div className="flex items-center gap-x-5">
                <LoginLink>
                  <Button variant={'secondary'}>Logga in</Button>
                </LoginLink>

                <Button>
                  <RegisterLink>Skapa konto</RegisterLink>
                </Button>
              </div>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
}
