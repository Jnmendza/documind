import Link from "next/link";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";

export default function Navbar({ userId }: { userId: string | null }) {
  return (
    <nav className='flex items-center justify-between p-6 max-w-7xl mx-auto w-full'>
      <div className='flex items-center gap-2 font-bold text-xl text-slate-900'>
        <div className='bg-indigo-600 p-1.5 rounded-lg'>
          <Sparkles className='w-5 h-5 text-white' />
        </div>
        DocuMind
      </div>

      <div className='flex gap-4'>
        {userId ? (
          <Link href='/dashboard'>
            <Button>Go to Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link href='/sign-in'>
              <Button variant='ghost'>Log In</Button>
            </Link>
            <Link href='/sign-up'>
              <Button>Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
