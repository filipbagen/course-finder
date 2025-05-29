import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function signOut() {
  'use server';
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export default async function PrivatePage() {
  const supabase = await createClient();

  // Use getUser() to verify authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users to the landing page
  if (!user || error) {
    redirect('/');
  }

  // Fetch user data from your users table
  const { data: userData, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to your private dashboard!
            </h1>

            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    You are successfully authenticated!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Auth User Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Authentication Information
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      User ID
                    </dt>
                    <dd className="text-sm text-gray-900 font-mono">
                      {user.id}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Custom User Table Information */}
              {userData && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Profile Information
                  </h3>
                  <p className="text-green-600">✅ User found in database!</p>
                </div>
              )}

              {userError && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Profile Information Unavailable
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Could not load profile data: {userError.message}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <form action={signOut}>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
