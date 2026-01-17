"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Trash2, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteDocument } from "@/app/actions";
import { toast } from "sonner";

interface DocumentCardProps {
  doc: {
    id: string;
    title: string;
    createdAt: Date;
    content: string | null;
  };
}

export default function DocumentCard({ doc }: DocumentCardProps) {
  const [isDeleting, startDelete] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    startDelete(async () => {
      try {
        await deleteDocument(doc.id);
        toast.success("Document deleted");
      } catch (e) {
        toast.error("Failed to delete");
      }
    });
  };

  return (
    <>
      <Card className='group hover:shadow-md transition-shadow relative'>
        {/* CLICKABLE AREA (Goes to Editor) */}
        <Link
          href={`/dashboard/document/${doc.id}`}
          className='absolute inset-0 z-0'
        />

        <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
          <CardTitle className='text-lg font-semibold truncate pr-8'>
            {doc.title}
          </CardTitle>

          {/* MENU BUTTON (Z-Index > 0 so link doesn't capture click) */}
          <div className='z-10 relative'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                >
                  <MoreVertical className='h-4 w-4 text-slate-500 cursor-pointer' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  className='text-red-600 cursor-pointer focus:text-red-600'
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(true);
                  }}
                >
                  <Trash2 className='w-4 h-4 mr-2' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className='flex items-center space-x-2 text-sm text-slate-500 mb-4'>
            <FileText className='w-4 h-4' />
            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
          </div>
          <p className='text-sm text-slate-600 line-clamp-3'>
            {doc.content || "No content available."}
          </p>
        </CardContent>
      </Card>

      {/* CONFIRMATION DIALOG */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              <span className='font-bold text-black'> "{doc.title}"</span> and
              all its AI data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='cursor-pointer'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer'
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
