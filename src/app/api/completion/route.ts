import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  // 1. Security Check
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  // 2. Get the Prompt from the client
  // The hook sends a JSON body with { prompt: "..." }
  const { prompt } = await req.json();

  // 3. Call Google Gemini
  // We use streamText to keep the connection open
  const result = streamText({
    model: google("models/gemini-flash-latest"),
    system:
      "You are a helpful business writing assistant. Output clean markdown.",
    prompt: prompt,
  });

  // 4. Return the stream
  return result.toTextStreamResponse();
}
