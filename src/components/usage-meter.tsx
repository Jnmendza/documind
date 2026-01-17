import { auth } from "@clerk/nextjs/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { Progress } from "@/components/ui/progress";

export async function UsageMeter() {
  const { userId } = await auth();
  if (!userId) return null;

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 d"),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });

  const { remaining, limit, reset } = await ratelimit.limit(userId);

  const used = limit - remaining;
  const percentage = (used / limit) * 100;

  return (
    <div className='bg-slate-50 border rounded-lg p-4 space-y-2'>
      <div className='flex justify-between text-sm font-medium'>
        <span>Daily Credits</span>
        <span>
          {remaining} / {limit} Remaining
        </span>
      </div>
      <Progress value={percentage} className='h-2' />
      <p className='text-xs text-gray-500'>
        Resets at {new Date(reset).toLocaleTimeString()}.
      </p>
    </div>
  );
}
