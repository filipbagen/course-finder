import Link from 'next/link';
import { ThemeToggle } from './themeToggle';

// kinde
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

// shadcn
import { Button } from '@/components/ui/button';

export async function Navbar() {
  const { isAuthenticated } = getKindeServerSession();

  return (
    <nav className="border-b bg-background h-[10vh] flex items-center">
      <div className="container flex items-center justify-between">
        <Link href="/">
          <h1 className="font-semibold">🧭 Course Finder</h1>
        </Link>

        <div className="flex items-center gap-x-5">
          <ThemeToggle />

          {(await isAuthenticated()) ? (
            <LogoutLink>
              <Button>Log out</Button>
            </LogoutLink>
          ) : (
            <div className="flex items-center gap-x-5">
              <LoginLink>
                <Button>Sign In</Button>
              </LoginLink>

              <Button variant={'secondary'}>
                <RegisterLink>Sign up</RegisterLink>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
