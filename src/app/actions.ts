"use server";

import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { documents, generations } from "@/db/schema";

// Use 'require' to avoid TypeScript "no default export" issues with this specific package
const { PDFParse } = require("pdf-parse");

// (Optional) Keep the polyfill just in case, though v2 is more robust
// @ts-ignore
if (!global.DOMMatrix) {
  // @ts-ignore
  global.DOMMatrix = Array;
}

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

export async function createDocumentByUpload(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Instead of pdfParse(buffer), we create a new instance
  const parser = new PDFParse({ data: buffer });

  // Extract the text
  const result = await parser.getText();
  const extractedText = result.text;

  // Cleanup to free memory (Important in v2!)
  await parser.destroy();

  // Save to Database (Same as before)
  const [newDoc] = await db
    .insert(documents)
    .values({
      userId: userId,
      title: file.name,
      content: extractedText || "No text found in PDF.",
    })
    .returning();

  revalidatePath("/dashboard");
  return { success: true, docId: newDoc.id };
}

export async function updateDocument(documentId: string, newContent: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

  if (!doc) throw new Error("Unauthorized");

  // Update the content
  await db
    .update(documents)
    .set({ content: newContent })
    .where(eq(documents.id, documentId));

  revalidatePath(`/dashboard/document/${documentId}`);
}

export async function deleteDocument(documentId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

  if (!doc) throw new Error("Unauthorized");

  // Delete the document
  await db.delete(documents).where(eq(documents.id, documentId));

  revalidatePath("/dashboard");
}
