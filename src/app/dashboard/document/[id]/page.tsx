import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { documents, generations } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import AiEditor from "@/components/ai-editor";

// Define the shape of the params (Next.js 15 requires awaiting params)
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  // 1. Fetch the specific document
  // Security: We MUST check that the document belongs to the current userId
  const doc = await db.query.documents.findFirst({
    where: and(eq(documents.id, id), eq(documents.userId, userId)),
  });

  // 2. Handle 404 (Security / Not Found)
  if (!doc) {
    notFound();
  }

  // 3. Fetch the latest AI Generation
  const latestGen = await db.query.generations.findFirst({
    where: eq(generations.documentId, doc.id),
    orderBy: [desc(generations.createdAt)],
  });

  return (
    <div className='max-w-4xl mx-auto p-10 space-y-8'>
      <div className='flex justify-between items-start'>
        <h1 className='text-4xl font-bold'>{doc.title}</h1>
        <span className='text-sm text-gray-400'>
          Created: {doc.createdAt.toLocaleDateString()}
        </span>
      </div>

      <div className='bg-white border rounded-md p-6 min-h-[50vh] shadow-sm'>
        <AiEditor
          documentId={doc.id}
          initialContent={doc.content || ""}
          initialAiResponse={latestGen?.aiOutput}
        />
      </div>
    </div>
  );
}
