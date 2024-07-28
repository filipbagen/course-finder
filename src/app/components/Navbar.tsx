import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  UsersRound,
  CalendarDays,
  Settings,
  DoorClosed,
} from 'lucide-react';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// components
import { UserNav } from './UserNav';

export async function Navbar() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <MaxWidthWrapper className="mb-8 flex justify-between items-center sticky h-16 inset-x-0 top-0 z-30 w-full border-b border-border bg-background/75 backdrop-blur-lg transition-all">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex gap-2 items-center">
            <img src="/assets/compass.png" alt="logo" className="h-6 w-6" />
            <h4 className="font-semibold mr-12 whitespace-nowrap">
              Course Finder
            </h4>
          </Link>

          <div className="hidden sm:flex items-center gap-x-5">
            {user ? (
              <>
                <Button variant="ghost">
                  <Link href="/dashboard/schedule">Schema</Link>
                </Button>
                <Button variant="ghost">
                  <Link href="/dashboard/social">Användare</Link>
                </Button>
                <UserNav
                  email={user?.email as string}
                  name={user?.given_name as string}
                  image={user?.picture as string}
                />
              </>
            ) : (
              <>
                <LoginLink>
                  <Button variant="secondary">Logga in</Button>
                </LoginLink>
                <Button>
                  <RegisterLink>Skapa konto</RegisterLink>
                </Button>
              </>
            )}
          </div>

          <div className="sm:hidden flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full">
                    <Menu />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 p-4"
                  align="end"
                  forceMount
                >
                  <div className="flex flex-col space-y-1">
                    <UserNav
                      email={user?.email as string}
                      name={user?.given_name as string}
                      image={user?.picture as string}
                    />
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="flex gap-3 items-center">
                        <CalendarDays size={20} />
                        <Link href="/dashboard/schedule">Schema</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex gap-3 items-center">
                        <UsersRound size={20} />
                        <Link href="/dashboard/social">Användare</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex gap-3 items-center">
                        <Settings size={20} />
                        <Link href="/dashboard/settings">Inställningar</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex gap-3 items-center">
                        <DoorClosed size={20} />
                        <LogoutLink>Logga ut</LogoutLink>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginLink>
                <Button variant="outline">Logga in</Button>
              </LoginLink>
            )}
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
