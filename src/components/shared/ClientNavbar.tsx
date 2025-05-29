'use client';

import Link from 'next/link';
import { MaxWidthWrapper } from './MaxWidthWrapper';
import Image from 'next/image';

import { Button } from '../ui/button';
import { UserNav } from './UserNav';

// Auth buttons
// import { SignInButton, SignUpButton, SignOutButton } from './auth/AuthButtons';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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
                  name={
                    user?.user_metadata?.name ||
                    user?.user_metadata?.full_name ||
                    ''
                  }
                  image={user?.user_metadata?.avatar_url as string}
                />
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Logga in</Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="default">Skapa konto</Button>
                </Link>
              </>
            )}
          </div>

          {/* <div className="sm:hidden flex items-center">
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
                    <p className="font-medium text-sm">
                      {user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
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
                        <SignOutButton />
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline">Logga in</Button>
              </Link>
            )}
          </div> */}
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
