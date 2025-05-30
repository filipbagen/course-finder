import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { MaxWidthWrapper } from '@/components/shared/MaxWidthWrapper';
import { Navbar } from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Course Finder',
  description: 'Find and review courses',
};

async function getData(userId: string) {
  if (userId) {
    try {
      const data = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          colorScheme: true,
        },
      });
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }
  return null;
}

async function getUser() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data?.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const data = await getData(user?.id as string);

  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${inter.className} ${data?.colorScheme ?? 'theme-blue'}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MaxWidthWrapper className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-6">{children}</main>
            <Footer />
          </MaxWidthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
