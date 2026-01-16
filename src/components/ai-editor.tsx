"use client";

import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles } from "lucide-react";
import { saveGeneration } from "@/app/actions";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface AiEditorProps {
  documentId: string;
  initialContent: string;
  initialAiResponse?: string;
}

export default function AiEditor({
  documentId,
  initialContent,
  initialAiResponse,
}: AiEditorProps) {
  const { complete, completion, isLoading } = useCompletion({
    api: "/api/completion",
    streamProtocol: "text",
    onError: (err) => {
      // The error message comes from the Response body set above
      const message = err.message || "Something went wrong";

      if (message.includes("daily limit")) {
        toast.error("Daily Limit Reached", {
          description:
            "You have used your 3 free credits for today. Upgrade to Pro for unlimited access.",
          descriptionClassName: "!text-zinc-700 font-medium",
          action: {
            label: "Upgrade",
            onClick: () => console.log("Redirect to Stripe..."),
          },
        });
      } else {
        toast.error("AI Error", { description: message });
      }
    },
    initialCompletion: initialAiResponse,
    onFinish: async (prompt, result) => {
      console.log("Saving to DB...");
      await saveGeneration({
        documentId,
        originalPrompt: prompt,
        aiOutput: result,
      });
      toast.success("AI Output saved!");
    },
  });

  const runAi = (command: string) => {
    complete(`
      Original Text:
      "${initialContent}"

      Instruction:
      ${command}
    `);
  };

  return (
    <div className='space-y-6'>
      <div className='flex gap-2 flex-wrap'>
        <Button
          variant='outline'
          disabled={isLoading}
          onClick={() => runAi("Summarize this in 3 bullet points.")}
        >
          <Sparkles className='w-4 h-4 mr-2 text-indigo-500' />
          Summarize
        </Button>
        <Button
          variant='outline'
          disabled={isLoading}
          onClick={() => runAi("Rewrite this to sound more professional.")}
        >
          👔 Professional
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]'>
        {/* LEFT CARD: ORIGINAL */}
        <Card className='h-full bg-slate-50 border-slate-200 overflow-hidden'>
          <CardContent className='p-0 h-full'>
            {/* ScrollArea requires a fixed height to work or 'h-full' on parent */}
            <ScrollArea className='h-full p-6'>
              <h3 className='font-semibold text-gray-500 mb-4 text-sm uppercase'>
                Original
              </h3>
              <div className='whitespace-pre-wrap text-sm leading-relaxed text-gray-700'>
                {initialContent}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* RIGHT CARD: AI OUTPUT */}
        <Card className='h-full border-indigo-200 shadow-sm overflow-hidden'>
          <CardContent className='p-0 h-full bg-white'>
            <ScrollArea className='h-full p-6'>
              <h3 className='font-semibold text-indigo-500 mb-4 text-sm uppercase flex items-center'>
                {isLoading ? (
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                ) : (
                  "AI Output"
                )}
              </h3>

              {completion ? (
                <div className='prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-[400px]'>
                  <ReactMarkdown>{completion}</ReactMarkdown>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center h-40 text-gray-400 text-sm italic mt-20'>
                  <Sparkles className='w-8 h-8 mb-2 opacity-20' />
                  Select an option above
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
