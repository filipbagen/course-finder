'use client';

import Link from 'next/link';
import { MaxWidthWrapper } from './MaxWidthWrapper';
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
import {
  Menu,
  Calendar,
  Users,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { SignOutButton } from '@/components/shared/SignOutButton';
import type { User as SupabaseUser } from '@supabase/supabase-js';

type ClientNavbarProps = {
  user: SupabaseUser | null;
};

export default function ClientNavbar({ user }: ClientNavbarProps) {
  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || '';
  const userEmail = user?.email || '';
  const userImage = user?.user_metadata?.avatar_url || '';

  return (
    <div className="sticky h-16 inset-x-0 top-0 z-30 w-full border-b border-border bg-background/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href={user ? "/courses" : "/"} className="flex gap-2 items-center">
            <Image
              src="/assets/compass.png"
              alt="Course Finder logo"
              width={24}
              height={24}
            />
            <h4 className="font-semibold whitespace-nowrap">
              Course Finder
            </h4>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-x-6">
            {user ? (
              // Authenticated User Navigation
              <>
                <Link href="/courses">
                  <Button variant="ghost" className="text-sm font-medium">
                    Explore Courses
                  </Button>
                </Link>
                
                <Link href="/schedule">
                  <Button variant="ghost" className="text-sm font-medium">
                    My Schedule
                  </Button>
                </Link>
                
                <Link href="/students">
                  <Button variant="ghost" className="text-sm font-medium">
                    Find Students
                  </Button>
                </Link>
                
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger>
                      <Avatar className="h-9 w-9">
                        {userImage ? (
                          <AvatarImage src={userImage} alt={userName || userEmail} />
                        ) : (
                          <AvatarFallback className="text-sm">
                            {userName?.charAt(0)?.toUpperCase() || userEmail?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userName || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userEmail}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/profile" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/settings" className="flex items-center w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <SignOutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Unauthenticated User Navigation
              <>
                <Link href="/courses">
                  <Button variant="ghost" className="text-sm font-medium">
                    Explore Courses
                  </Button>
                </Link>
                
                <Link href="/login">
                  <Button variant="ghost" className="text-sm font-medium">
                    Sign In
                  </Button>
                </Link>
                
                <Link href="/signup">
                  <Button className="text-sm font-medium">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {user ? (
                  // Authenticated Mobile Menu
                  <>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userName || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userEmail}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/courses" className="flex items-center w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Explore Courses
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/schedule" className="flex items-center w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        My Schedule
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/students" className="flex items-center w-full">
                        <Users className="mr-2 h-4 w-4" />
                        Find Students
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/profile" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/settings" className="flex items-center w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <SignOutButton />
                    </DropdownMenuItem>
                  </>
                ) : (
                  // Unauthenticated Mobile Menu
                  <>
                    <DropdownMenuItem>
                      <Link href="/courses" className="w-full">Explore Courses</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/login" className="w-full">Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/signup" className="font-medium w-full">Sign Up</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}