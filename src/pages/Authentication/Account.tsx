import React from 'react';
import { Button } from '@/components/ui/button';

function Account() {
  return (
    <div className="max-w-[600px] mx-auto my-16 p-4">
      <h1 className="text-2xl font-bold py-4">Account</h1>
      <p>User Email:</p>

      <Button>Logout</Button>
    </div>
  );
}

export default Account;
