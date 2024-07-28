// react
import Link from 'next/link';

// icons
import { Settings } from 'lucide-react';

// shadcn
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './themeToggle';

// kinde
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';

// icons
import { DoorClosed, CreditCard } from 'lucide-react';

export function UserNav({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image: string;
}) {
  return (
    <>
      <div className="sm:hidden flex items-center gap-2">
        <Avatar className="h-10 w-10 rounded-full">
          <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">{email}</span>
        </div>
      </div>

      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 rounded-full">
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ThemeToggle />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="w-full flex justify-between items-center"
              asChild
            >
              <Link href={'/dashboard/settings'}>
                Inställningar <Settings className="w-4 h-4" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="w-full flex justify-between items-center"
              asChild
            >
              <LogoutLink>
                Logga ut <DoorClosed className="w-4 h-4" />
              </LogoutLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
