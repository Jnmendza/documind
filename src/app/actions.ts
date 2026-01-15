"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { revalidatePath } from "next/cache";

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
    .returning(); // <--- Returns the created row

  // 5. Revalidate & Redirect
  // This tells Next.js: "The data on /dashboard has changed, refresh it."
  revalidatePath("/dashboard");

  return { success: true };
}
