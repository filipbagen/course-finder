// next
import { redirect } from 'next/navigation';

// components
import { ForgotPasswordForm } from './ForgotPasswordForm';

// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail } from 'lucide-react';

// supabase
import { createClient } from '@/lib/supabase/server';

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
