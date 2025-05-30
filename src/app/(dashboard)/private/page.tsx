import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/auth';

export default async function PrivatePage() {
  const supabase = await createClient()

  // Use getUser() to verify authentication
  const { data: { user }, error } = await supabase.auth.getUser()

  // Redirect unauthenticated users to the landing page
  if (!user || error) {
    redirect('/')
  }

  // Use Prisma instead of Supabase direct queries to avoid async cookie issues
  let userData
  let userError = null

  try {
    userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        colorScheme: true,
        isPublic: true,
        program: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  } catch (error) {
    console.error('Error fetching user with Prisma:', error)
    userError = { message: 'Database connection error' }
  }

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
                    <dt className="text-sm font-medium text-gray-500">User ID</dt>
                    <dd className="text-sm text-gray-900 font-mono">
                      {user.id}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Database User Information */}
              {userData && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Profile Information
                  </h3>
                  <p className="text-green-600 mb-4">✅ User found in database!</p>
                  
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="text-sm text-gray-900">{userData.name || 'Not set'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Program</dt>
                      <dd className="text-sm text-gray-900">{userData.program || 'Not set'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Theme</dt>
                      <dd className="text-sm text-gray-900">{userData.colorScheme}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Profile Visibility</dt>
                      <dd className="text-sm text-gray-900">
                        {userData.isPublic ? 'Public' : 'Private'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="text-sm text-gray-900">
                        {userData.createdAt?.toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Updated</dt>
                      <dd className="text-sm text-gray-900">
                        {userData.updatedAt?.toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
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
                    <p className="text-sm text-yellow-700 mt-1">
                      You may need to complete onboarding first.
                    </p>
                  </div>
                </div>
              )}

              {!userData && !userError && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h3 className="text-sm font-medium text-blue-800">
                      Complete Your Profile
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      You haven't completed your profile setup yet.
                    </p>
                    <a
                      href="/onboarding"
                      className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      Complete Onboarding
                    </a>
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
  )
}