import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db"; // Our database connection
import { users } from "@/db/schema"; // Our schema
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  // 1. Get the user from Clerk
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  // 2. CHECK: Does this user exist in our DB?
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  // 3. INSERT: If not, add them (The "Lazy Sync")
  if (!existingUser) {
    // We only need the primary email
    const email = user.emailAddresses[0]?.emailAddress ?? "no-email";

    await db.insert(users).values({
      id: userId,
      email: email,
      isPro: false,
    });
    console.log(`🆕 New User Synced: ${email}`);
  }

  // 4. Render the UI
  return (
    <div className='p-10 max-w-4xl mx-auto space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground mt-2'>
            Welcome back, {user.firstName || "User"}.
          </p>
        </div>

        {/* Simple Badge to show DB status */}
        <div className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200'>
          Database Connected
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Placeholder Cards */}
        <div className='border rounded-xl p-6 shadow-sm'>
          <h3 className='font-semibold mb-2'>My Documents</h3>
          <p className='text-2xl font-bold'>0</p>
        </div>
        <div className='border rounded-xl p-6 shadow-sm'>
          <h3 className='font-semibold mb-2'>Generations</h3>
          <p className='text-2xl font-bold'>0</p>
        </div>
      </div>
    </div>
  );
}
