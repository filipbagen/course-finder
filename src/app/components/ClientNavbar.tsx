'use client';

import Link from 'next/link';
import { MaxWidthWrapper } from './MaxWidthWrapper';
import Image from 'next/image';

import { useCounterStore } from '@/stores/store';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';

// kinde
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from '@kinde-oss/kinde-auth-nextjs/components';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  CalendarDays,
  UsersRound,
  Settings,
  DoorClosed,
} from 'lucide-react';

type ClientNavbarProps = {
  user: any; // Replace with actual user type if available
};

export default function ClientNavbar({ user }: ClientNavbarProps) {
  const count = useCounterStore((state) => state.count);

  return (
    <div className="mb-8 flex justify-between items-center sticky h-16 inset-x-0 top-0 z-30 w-full border-b border-border bg-background/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex gap-2 items-center">
            <Image
              src="/assets/compass.png"
              alt="logo"
              width={24}
              height={24}
            />
            <h4 className="font-semibold mr-12 whitespace-nowrap">
              Course Finder
            </h4>
          </Link>

          <div className="hidden sm:flex items-center gap-x-5">
            {user ? (
              <>
                <Link href="/dashboard/schedule">
                  <Button variant="ghost">Schema</Button>
                </Link>

                <Link href="/dashboard/social">
                  <Button variant="ghost">Användare</Button>
                </Link>
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
      </MaxWidthWrapper>
    </div>
  );
}
