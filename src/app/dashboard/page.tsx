import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import NewDocumentButton from "@/components/new-doc-btn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { documents } from "@/db/schema";
import Link from "next/link";
import { UsageMeter } from "@/components/usage-meter";

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

  // 4. Get the user's documents
  const userDocuments = await db.query.documents.findMany({
    where: eq(documents.userId, userId),
    orderBy: (documents, { desc }) => [desc(documents.createdAt)],
  });
  return (
    <div className='p-10 max-w-4xl mx-auto space-y-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        {/* The New Button */}
        <NewDocumentButton />
      </div>
      <div className='max-w-md'>
        <UsageMeter />
      </div>

      {/* Grid of Documents */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {userDocuments.length === 0 ? (
          <div className='col-span-full text-center text-gray-500 py-10'>
            No documents yet. Click "New Document" to get started.
          </div>
        ) : (
          userDocuments.map((doc) => (
            <Link
              key={doc.id}
              href={`/dashboard/document/${doc.id}`}
              className='block'
            >
              <Card
                key={doc.id}
                className='hover:bg-slate-50 transition cursor-pointer'
              >
                <CardHeader>
                  <CardTitle className='truncate'>{doc.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground line-clamp-3'>
                    {doc.content || "No content"}
                  </p>
                  <p className='text-xs text-gray-400 mt-4'>
                    {doc.createdAt.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
