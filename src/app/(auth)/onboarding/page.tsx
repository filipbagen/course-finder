import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingForm from './onboarding-form';

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users
  if (!user || error) {
    redirect('/login');
  }

  // Check if user has already completed onboarding
  const { data: userData } = await supabase
    .from('User')
    .select('name, program')
    .eq('id', user.id)
    .single();

  // If user already has name and program, redirect to courses
  if (userData?.name && userData?.program) {
    redirect('/courses');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to Course Finder! 🎓
              </h1>
              <p className="mt-2 text-gray-600">
                Let's set up your profile to get started
              </p>
            </div>

            <OnboardingForm userId={user.id} userEmail={user.email!} />
          </div>
        </div>
      </div>
    </div>
  );
}
