import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { BrainCircuit, FileText, Zap, Shield } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/nav-bar";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col'>
      {/* 1. NAVBAR */}
      <Navbar userId={userId} />

      {/* 2. HERO SECTION */}
      <main className='flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden'>
        {/* Abstract Background Glow */}
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] -z-10' />

        <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8'>
          <Zap className='w-4 h-4 fill-indigo-500 text-indigo-500' />
          <span>Powered by Google Gemini 1.5 Flash</span>
        </div>

        <h1 className='text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl'>
          Chat with your documents <br />
          <span className='text-indigo-600'>in seconds.</span>
        </h1>

        <p className='text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed'>
          Upload PDFs or paste text. Our AI analyzes your content instantly,
          giving you summaries, rewrites, and professional insights.
        </p>

        <div className='flex gap-4 flex-col sm:flex-row'>
          <Link href={userId ? "/dashboard" : "/sign-up"}>
            <Button
              size='lg'
              className='h-12 px-8 text-lg shadow-lg shadow-indigo-200'
            >
              {userId ? "Go to Dashboard" : "Start for Free"}
            </Button>
          </Link>
          <Link href='#features'>
            <Button size='lg' variant='outline' className='h-12 px-8 text-lg'>
              How it works
            </Button>
          </Link>
        </div>

        {/* Pseudo-Screenshot / Visual */}
        <div className='mt-20 w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-200 p-2 sm:p-4 rotate-1 hover:rotate-0 transition duration-700 ease-out'>
          <div className='bg-slate-50 rounded-lg border border-slate-100 aspect-video flex items-center justify-center overflow-hidden relative'>
            {/* This mimics your editor UI */}
            <div className='absolute inset-0 flex'>
              <div className='w-1/2 border-r p-8 space-y-4'>
                <div className='h-4 w-1/3 bg-slate-200 rounded animate-pulse' />
                <div className='h-2 w-full bg-slate-100 rounded' />
                <div className='h-2 w-full bg-slate-100 rounded' />
                <div className='h-2 w-3/4 bg-slate-100 rounded' />
              </div>
              <div className='w-1/2 p-8 space-y-4 bg-indigo-50/10'>
                <div className='h-4 w-1/4 bg-indigo-200 rounded animate-pulse' />
                <div className='h-2 w-full bg-indigo-100 rounded' />
                <div className='h-2 w-5/6 bg-indigo-100 rounded' />
              </div>
            </div>
            <span className='z-10 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-slate-500'>
              Interactive Editor Demo
            </span>
          </div>
        </div>
      </main>

      {/* 3. FEATURES GRID */}
      <section
        id='features'
        className='py-24 bg-white border-t border-slate-100'
      >
        <div className='max-w-7xl mx-auto px-6'>
          <h2 className='text-3xl font-bold text-center mb-16'>
            Everything you need to write faster
          </h2>
          <div className='grid md:grid-cols-3 gap-12'>
            <FeatureCard
              icon={<BrainCircuit className='w-8 h-8 text-indigo-600' />}
              title='AI Analysis'
              desc='Uses Gemini 1.5 Flash to understand context, tone, and nuance in your documents.'
            />
            <FeatureCard
              icon={<FileText className='w-8 h-8 text-blue-600' />}
              title='PDF Support'
              desc='Drag and drop PDF files. We extract the text automatically so you can chat with it.'
            />
            <FeatureCard
              icon={<Shield className='w-8 h-8 text-green-600' />}
              title='Secure & Private'
              desc='Your documents are stored securely. You have full control to delete data at any time.'
            />
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className='py-12 bg-slate-50 border-t border-slate-200 text-center text-slate-500 text-sm'>
        <p>
          &copy; {new Date().getFullYear()} DocuMind. Built with Next.js 16 &
          Gemini.
        </p>
      </footer>
    </div>
  );
}

// Simple Helper Component for the Feature Grid
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className='flex flex-col items-center text-center space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition duration-300'>
      <div className='p-4 bg-white rounded-full shadow-sm border border-slate-100'>
        {icon}
      </div>
      <h3 className='text-xl font-semibold text-slate-900'>{title}</h3>
      <p className='text-slate-600 leading-relaxed'>{desc}</p>
    </div>
  );
}
