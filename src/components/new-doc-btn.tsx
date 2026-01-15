"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createDocument } from "@/app/actions";
import { useTransition, useState } from "react";
import { toast } from "sonner";

export default function NewDocumentButton() {
  const [isOpen, setIsOpen] = useState(false);
  // useTransition allows us to show a "Pending" state while the Server Action runs
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await createDocument(formData);
        setIsOpen(false); // Close modal on success
        toast.success("Document created successfully");
      } catch (error) {
        console.error("Failed to create", error);
        toast.error("Failed to create document. Please try again.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>+ New Document</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a New Project</DialogTitle>
          <DialogDescription>Paste your rough notes below.</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className='space-y-4 mt-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              name='title'
              placeholder='e.g. Weekly Meeting Notes'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='content'>Content</Label>
            <Textarea
              id='content'
              name='content'
              placeholder='Paste your text here...'
              className='min-h-[200px]'
            />
          </div>

          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? "Creating..." : "Create Document"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
