import { UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-slate-50'>
      {/* SHARED HEADER */}
      <header className='sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md'>
        <div className='flex h-16 items-center justify-between px-6 max-w-7xl mx-auto'>
          {/* Logo - Click to go back to Dashboard Home */}
          <Link
            href='/dashboard'
            className='flex items-center gap-2 font-bold text-slate-900 hover:opacity-80 transition'
          >
            <div className='bg-indigo-600 p-1.5 rounded-lg'>
              <Sparkles className='w-4 h-4 text-white' />
            </div>
            DocuMind
          </Link>

          {/* User Profile & Logout */}
          <div className='flex items-center gap-4'>
            <span className='text-sm text-slate-500 hidden sm:inline'>
              My Workspace
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className='max-w-7xl mx-auto py-8'>{children}</main>
    </div>
  );
}
