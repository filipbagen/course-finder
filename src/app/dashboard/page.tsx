import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import Logout from "../_components/Logout";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) {
    redirect("/login");
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: data.session.user.id },
    include: { course: true }
  });
  
  const user = await prisma.user.findUnique({
    where: { id: data.session.user.id },
  });
  
  return (
    <main className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Logout />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <div className="flex flex-col space-y-2">
          <p><span className="font-medium">Name:</span> {user?.name}</p>
          <p><span className="font-medium">Email:</span> {user?.email}</p>
          <p><span className="font-medium">Program:</span> {user?.program || 'Not set'}</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Enrollments</h2>
        {enrollments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{enrollment.course.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{enrollment.course.code}</p>
                <p className="mt-2">Semester: {enrollment.semester}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>You are not enrolled in any courses yet.</p>
        )}
      </div>
    </main>
  );
}