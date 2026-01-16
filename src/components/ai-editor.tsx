"use client";
import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Save, PenLine } from "lucide-react";
import { saveGeneration, updateDocument } from "@/app/actions";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";

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
  const [content, setContent] = useState<string>(initialContent || "");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Check if text is different from initial content
  const isDirty = content !== initialContent;

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/completion",
    streamProtocol: "text",
    initialCompletion: initialAiResponse,
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
    onFinish: async (prompt, result) => {
      if (!result) return;
      toast.promise(
        saveGeneration({
          documentId,
          originalPrompt: prompt,
          aiOutput: result,
        }),
        {
          loading: "Saving AI response",
          success: "Saved to database!",
          error: "Failed to save.",
        }
      );
    },
  });

  const handleSaveOriginal = async () => {
    setIsSaving(true);
    try {
      await updateDocument(documentId, content);
      toast.success("Document updated!");
    } catch (error) {
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const runAi = (command: string) => {
    complete(`
      Original Text:
      "${content}"

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
        <Card className='flex flex-col h-full bg-white border-slate-200 shadow-sm overflow-hidden'>
          {/* HEADER WITH SAVE BUTTON */}
          <CardHeader className='flex flex-row items-center justify-between py-3 px-5 bg-slate-50 border-b border-slate-100'>
            <CardTitle className='font-semibold text-gray-500 text-sm uppercase flex items-center gap-2'>
              <PenLine className='w-4 h-4' />
              Original Content
            </CardTitle>
            {isDirty && (
              <Button
                size='sm'
                variant='outline'
                onClick={handleSaveOriginal}
                disabled={isSaving}
                className='h-8 text-xs cursor-pointer bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 transition-colors'
              >
                {isSaving ? (
                  <Loader2 className='w-3 h-3 animate-spin mr-1' />
                ) : (
                  <Save className='w-3 h-3 mr-1' />
                )}
                Save Changes
              </Button>
            )}
          </CardHeader>

          <CardContent className='p-0 flex-1 h-full'>
            {/* TEXTAREA REPLACES DIV */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className='w-full h-full resize-none border-0 focus-visible:ring-0 p-5 text-sm leading-relaxed text-gray-700 rounded-none'
              placeholder='Enter your text here...'
            />
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
