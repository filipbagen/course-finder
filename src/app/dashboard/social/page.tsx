'use client';

// pages/users.tsx
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  stripeCustomerId: string;
  colorScheme: string;
  isPublic: boolean;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    <div>
      <h1>Users</h1>
      <Input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '20px', padding: '10px', width: '300px' }}
      />
      {isLoading ? (
        <p>Loading...</p>
      ) : searchQuery ? (
        filteredUsers.length ? (
          <div className="bg-white shadow-2xl h-full w-full flex flex-col gap-2 p-6 rounded-md">
            {filteredUsers.map((user) => (
              <Link
                href={`/dashboard/social/${user.id}`}
                key={user.id}
                className="hover:bg-slate-300 transition"
              >
                {user.name} - {user.email}
              </Link>
            ))}
          </div>
        ) : (
          <p>No users found.</p>
        )
      ) : (
        <p>No users to display. Please enter a search query.</p>
      )}
    </div>
  );
};

export default UsersPage;
