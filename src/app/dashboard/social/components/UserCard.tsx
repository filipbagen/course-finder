import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User } from '@/app/utilities/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

const UserCard = ({ user }: { user: User }) => {
  return (
    <Card className="flex-grow h-min transition cursor-pointer hover:bg-background dark:hover:bg-background">
      <Link href={`/dashboard/social/${user.id}`}>
        <CardHeader>
          <div className="flex gap-4">
            <Avatar className="h-10 w-10 rounded-full">
              <AvatarImage src={user.image} alt="@shadcn" />
              <AvatarFallback>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Link>
    </Card>
  );
};

export default UserCard;
