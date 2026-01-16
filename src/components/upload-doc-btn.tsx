"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDocument, createDocumentByUpload } from "@/app/actions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, FileText, Plus, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function UploadDocumentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"text" | "pdf">("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const handleUpload = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await createDocumentByUpload(formData);
        if (result.success) {
          toast.success("PDF Uploaded!");
          setIsOpen(false);
          setSelectedFile(null);
          router.push(`/dashboard/document/${result.docId}`);
        }
      } catch (error) {
        toast.error("Upload Failed", {
          description: "File might be too large.",
        });
      }
    });
  };

  const handleCreate = async (formData: FormData) => {
    startTransition(async () => {
      await createDocument(formData);
      setIsOpen(false);
      toast.success("Document Created");
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className='cursor-pointer'>
          <Plus className='w-4 h-4 mr-2' />
          New Document
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Start a Project</DialogTitle>
          <DialogDescription>Choose how you want to begin.</DialogDescription>
        </DialogHeader>

        {/* TABS (Simple Toggle) */}
        <div className='flex gap-4 mb-4 border-b pb-4'>
          <div
            className={`cursor-pointer flex flex-col items-center p-4 border rounded-lg w-1/2 hover:bg-slate-50 transition ${mode === "text" ? "border-black ring-1 ring-black bg-slate-50" : ""}`}
            onClick={() => setMode("text")}
          >
            <FileText className='w-6 h-6 mb-2 text-slate-700' />
            <span className='text-sm font-medium'>Blank Text</span>
          </div>
          <div
            className={`cursor-pointer flex flex-col items-center p-4 border rounded-lg w-1/2 hover:bg-slate-50 transition ${mode === "pdf" ? "border-black ring-1 ring-black bg-slate-50" : ""}`}
            onClick={() => setMode("pdf")}
          >
            <Upload className='w-6 h-6 mb-2 text-indigo-600' />
            <span className='text-sm font-medium'>Upload PDF</span>
          </div>
        </div>

        {mode === "text" ? (
          /* REUSE YOUR OLD FORM HERE */
          <form action={handleCreate} className='space-y-4'>
            <div className='space-y-2'>
              <Label>Title</Label>
              <Input name='title' required placeholder='My Great Idea' />
            </div>
            <Button disabled={isPending} className='w-full cursor-pointer'>
              {isPending ? (
                <Loader2 className='animate-spin' />
              ) : (
                "Create Blank"
              )}
            </Button>
          </form>
        ) : (
          <form action={handleUpload} className='space-y-4'>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer relative flex flex-col items-center justify-center 
                    ${selectedFile ? "border-green-500 bg-green-50" : "border-slate-300 hover:bg-slate-100"}`}
            >
              <Input
                type='file'
                name='file'
                accept='.pdf'
                required
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />

              {selectedFile ? (
                // ✅ STATE A: File Selected
                <>
                  <CheckCircle className='w-8 h-8 text-green-600 mb-2' />
                  <p className='text-sm font-bold text-green-700 truncate max-w-[200px]'>
                    {selectedFile.name}
                  </p>
                  <p className='text-xs text-green-600 mt-1'>Click to change</p>
                </>
              ) : (
                // ⬜ STATE B: Empty
                <>
                  <Upload className='w-8 h-8 text-slate-400 mb-2' />
                  <p className='text-sm text-slate-600'>
                    Click or drag PDF here
                  </p>
                </>
              )}
            </div>

            <Button disabled={isPending} className='w-full cursor-pointer'>
              {isPending ? (
                <Loader2 className='animate-spin' />
              ) : // Dynamic Button Text
              selectedFile ? (
                "Upload & Extract"
              ) : (
                "Select a File"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
