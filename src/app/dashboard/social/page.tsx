'use client';

// pages/users.tsx
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/components/ui/select';
import UserCard from './UserCard';
import { User } from '@/app/utilities/types';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('');

  useEffect(() => {
    fetchData().catch(console.error);
  }, []);

  const fetchData = async () => {
    const response = await fetch('/api/users');
    const data = await response.json();

    setUsers(data); // Set the fetched data to state
    setLoading(false); // Set loading to false after data is fetched
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 w-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Hem</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Användare</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder="Sök användare..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex gap-4 items-center justify-between">
          <p>
            Visar <b>{searchQuery ? filteredUsers.length : 0}</b> sökresultat
          </p>

          {/* <Select onValueChange={(value) => setSortOrder(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="courseCode">Course Code (A-Z)</SelectItem>
              <SelectItem value="courseCodeReversed">
                Course Code (Z-A)
              </SelectItem>
              <SelectItem value="courseName">Course Name (A-Z)</SelectItem>
              <SelectItem value="courseNameReverse">
                Course Name (Z-A)
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select> */}
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : searchQuery ? (
        filteredUsers.length ? (
          <div className="bg-card shadow-2xl h-full w-full flex flex-col gap-2 p-6 rounded-md">
            {filteredUsers.map((user) => (
              <>
                <UserCard key={user.id} user={user} />
                <Separator />
              </>
            ))}
          </div>
        ) : (
          <p>Ingen användare kunde hittas.</p>
        )
      ) : null}
    </div>
  );
};

export default UsersPage;
