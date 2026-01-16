"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { documents, generations } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createDocument(formData: FormData) {
  // 1. Auth Check (Always verify on server)
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 2. Extract Data
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // 3. Simple Validation
  if (!title || title.trim() === "") {
    throw new Error("Title is required");
  }

  // 4. DB Insert
  await db
    .insert(documents)
    .values({
      userId: userId,
      title: title,
      content: content || "",
    })
    .returning();

  // 5. Revalidate & Redirect
  // This tells Next.js: "The data on /dashboard has changed, refresh it."
  revalidatePath("/dashboard");

  return { success: true };
}

export async function saveGeneration(input: {
  documentId: string;
  originalPrompt: string;
  aiOutput: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Find the doc ensuring the userId matches the requester
  const docOwner = await db.query.documents.findFirst({
    where: and(
      eq(documents.id, input.documentId),
      eq(documents.userId, userId)
    ),
  });
  // If no doc is found, it means either:
  // 1. It doesn't exist
  // 2. It exits, but belongs to someone else
  if (!docOwner) throw new Error("Unauthorized: You do not own this document.");
  await db.insert(generations).values({
    documentId: input.documentId,
    originalPrompt: input.originalPrompt,
    aiOutput: input.aiOutput,
  });

  revalidatePath(`/dashboard/document/${input.documentId}`);
}
