import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Menu, Calendar, Users, Settings, LogOut, User } from 'lucide-react';
import { SignOutButton } from '@/components/shared/SignOutButton';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

async function getUserData(userId: string) {
  try {
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
      },
    });
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user data from database if user is authenticated
  const userData = user ? await getUserData(user.id) : null;

  const userName =
    userData?.name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    '';
  const userEmail = userData?.email || user?.email || '';
  const userImage =
    userData?.image || user?.user_metadata?.avatar_url || undefined;

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-20 inset-x-0 top-0 z-30 w-full transition-all">
      {/* Glassmorphism Container */}
      <div className="mt-4 rounded-3xl bg-white/10 backdrop-blur-2xl min-w-64 dark:bg-[#14161A]/80 shadow-[0px_0px_0px_1px_rgba(100,6,69,0.10),0px_3px_6px_0px_rgba(100,6,69,0.12),0px_-4px_0px_0px_rgba(100,6,69,0.08)_inset] dark:shadow-[0px_0px_0px_1px_rgba(26,32,44,0.10),0px_3px_6px_0px_rgba(26,32,44,0.12),0px_-4px_0px_0px_rgba(26,32,44,0.08)_inset]">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo */}
          <Link
            href={user ? '/courses' : '/'}
            className="flex gap-2 items-center"
          >
            <Image
              src="/assets/compass.png"
              alt="Course Finder logo"
              width={22}
              height={22}
              className="transition-transform duration-150 group-hover:rotate-12"
            />
            <h4 className="font-medium whitespace-nowrap">Course Finder</h4>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-x-2">
            {user ? (
              // Authenticated User Navigation
              <>
                <Link href="/courses">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 border border-neutral-200 backdrop-blur-sm transition-all duration-150 hover:shadow-lg"
                  >
                    Utforska kurser
                  </Button>
                </Link>

                <Link href="/schedule">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 border border-neutral-200 backdrop-blur-sm transition-all duration-150 hover:shadow-lg"
                  >
                    Mitt schema
                  </Button>
                </Link>

                <Link href="/students">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 border border-neutral-200 backdrop-blur-sm transition-all duration-150 hover:shadow-lg"
                  >
                    Hitta studenter
                  </Button>
                </Link>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="ml-3">
                    <div className="p-1 rounded-full backdrop-blur-sm transition-all duration-150">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={userImage}
                          alt={userName || userEmail}
                          className="rounded-full"
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(userName || userEmail)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl mt-2"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="p-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-gray-900">
                          {userName || 'User'}
                        </p>
                        <p className="text-xs leading-none text-gray-600">
                          {userEmail}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/30" />
                    <DropdownMenuItem asChild className="rounded-xl mx-2 my-1">
                      <Link
                        href={user ? `/students/${user.id}` : '/login'}
                        className="flex items-center w-full p-3 hover:bg-white/50 transition-colors"
                      >
                        <User className="mr-3 h-4 w-4 text-gray-700" />
                        <span className="font-medium text-gray-900">
                          Min profil
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl mx-2 my-1">
                      <Link
                        href="/settings"
                        className="flex items-center w-full p-3 hover:bg-white/50 transition-colors"
                      >
                        <Settings className="mr-3 h-4 w-4 text-gray-700" />
                        <span className="font-medium text-gray-900">
                          Settings
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/30" />
                    <DropdownMenuItem className="flex items-center text-red-600 focus:text-red-600 rounded-xl mx-2 my-1 p-3 hover:bg-red-50/80 focus:bg-red-50/80 transition-colors">
                      <LogOut className="mr-3 h-4 w-4" />
                      <SignOutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Unauthenticated User Navigation
              <>
                <Link href="/courses">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 border border-neutral-200 backdrop-blur-sm transition-all duration-150 hover:shadow-lg"
                  >
                    Utforska kurser
                  </Button>
                </Link>

                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 border border-neutral-200 backdrop-blur-sm transition-all duration-150 hover:shadow-lg"
                  >
                    Sign In
                  </Button>
                </Link>

                <Link href="/signup">
                  <Button className="text-sm font-medium rounded-xl px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-150">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl p-2 bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm transition-all duration-150"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl mt-2"
                align="end"
                forceMount
              >
                {user ? (
                  // Authenticated Mobile Menu
                  <>
                    <DropdownMenuLabel className="p-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-gray-900">
                          {userName || 'User'}
                        </p>
                        <p className="text-xs leading-none text-gray-600">
                          {userEmail}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/30" />
                    <DropdownMenuItem asChild className="rounded-xl mx-2 my-1">
                      <Link
                        href="/courses"
                        className="flex items-center w-full p-3 hover:bg-white/50 transition-colors"
                      >
                        <Calendar className="mr-3 h-4 w-4 text-gray-700" />
                        <span className="font-medium text-gray-900">
                          Utforska kurser
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl mx-2 my-1">
                      <Link
                        href="/schedule"
                        className="flex items-center w-full p-3 hover:bg-white/50 transition-colors"
                      >
                        <Calendar className="mr-3 h-4 w-4 text-gray-700" />
                        <span className="font-medium text-gray-900">
                          Mitt schema
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl mx-2 my-1">
                      <Link
                        href="/students"
                        className="flex items-center w-full p-3 hover:bg-white/50 transition-colors"
                      >
                        <Users className="mr-3 h-4 w-4 text-gray-700" />
                        <span className="font-medium text-gray-900">
                          Hitta studenter
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/30" />
                    <DropdownMenuItem asChild className="rounded-xl mx-2 my-1">
                      <Link
                        href={user ? `/students/${user.id}` : '/login'}
                        className="flex items-center w-full p-3 hover:bg-white/50 transition-colors"
                      >
                        <User className="mr-3 h-4 w-4 text-gray-700" />
                        <span className="font-medium text-gray-900">
                          Min profil
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl mx-2 my-1">
                      <Link
                        href="/settings"
                        className="flex items-center w-full p-3 hover:bg-white/50 transition-colors"
                      >
                        <Settings className="mr-3 h-4 w-4 text-gray-700" />
                        <span className="font-medium text-gray-900">
                          Settings
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/30" />
                    <DropdownMenuItem className="flex items-center text-red-600 focus:text-red-600 rounded-xl mx-2 my-1 p-3 hover:bg-red-50/80 focus:bg-red-50/80 transition-colors">
                      <LogOut className="mr-3 h-4 w-4" />
                      <SignOutButton />
                    </DropdownMenuItem>
                  </>
                ) : (
                  // Unauthenticated Mobile Menu
                  <>
                    <DropdownMenuItem asChild className="rounded-xl mx-2 my-1">
                      <Link
                        href="/courses"
                        className="w-full p-3 hover:bg-white/50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">
                          Utforska kurser
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/30" />
                    <DropdownMenuItem asChild className="rounded-xl mx-2 my-1">
                      <Link
                        href="/login"
                        className="w-full p-3 hover:bg-white/50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">
                          Sign In
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl mx-2 my-1">
                      <Link
                        href="/signup"
                        className="font-semibold w-full p-3 hover:bg-white/50 transition-colors"
                      >
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                          Sign Up
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
