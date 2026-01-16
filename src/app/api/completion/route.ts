import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create the Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create the Ratelimit instance
// "slidingWindow" means if they used 3 credits at 2:00 PM yesterday,
// they get them back at 2:01 PM today. It's fairer than a fixed reset.
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 d"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export async function POST(req: Request) {
  // 1. Security Check
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  // Rate limit check
  const { success, limit, reset, remaining } = await ratelimit.limit(userId);

  if (!success) {
    return new Response("You have reached your daily limit.", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    });
  }

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
