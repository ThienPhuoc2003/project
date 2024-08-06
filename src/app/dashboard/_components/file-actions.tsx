import { Doc, Id } from "../../../../convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileIcon,
  MoreVertical,
  StarHalf,
  StarIcon,
  TrashIcon,
  UndoIcon,
} from "lucide-react";
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
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Protect } from "@clerk/nextjs";
import CommentModal from "./CommentModal";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

export function FileCardActions({
  file,
  isFavorited,
}: {
  file: Doc<"files"> & { url?: string | null };
  isFavorited: boolean;
}) {
  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const { toast } = useToast();
  const me = useQuery(api.users.getMe);
  const addComment = useMutation(api.files.addCommentToFile);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleCommentSubmit = (commentText: string) => {
    if (commentText.trim()) {
      addComment({
        fileId: file._id,
        userId: file.userId, // This should be the actual ID of the logged-in user
        commentText,
      })
        .then(() => {
          console.log("Comment added successfully");
        })
        .catch((error) => {
          console.error("Failed to add comment:", error);
        });
    }
  };

  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ đánh dấu tệp để xóa. Các tệp sẽ được xóa định kỳ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({
                  fileId: file._id,
                });
                toast({
                  variant: "default",
                  title: "Tệp đã được đánh dấu để xóa",
                  description: "Tệp của bạn sẽ sớm được xóa",
                });
              }}
            >
              Tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                if (!file.url) return;
                window.open("/dashboard/download/" + file.fileId, "_blank");
              }}
              className="flex gap-1 items-center cursor-pointer"
            >
              <FileIcon className="w-4 h-4" />
              Tải xuống
            </DropdownMenuItem>

            <DialogTrigger asChild>
              <DropdownMenuItem className="flex gap-1 items-center cursor-pointer">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 8h10M7 12h7m1-10a2 2 0 012 2v14l-4-4H5a2 2 0 01-2-2V4a2 2 0 012-2h14z"
                  ></path>
                </svg>
                <span>Bình luận</span>
              </DropdownMenuItem>
            </DialogTrigger>

            <DropdownMenuItem
              onClick={() => {
                toggleFavorite({
                  fileId: file._id,
                });
              }}
              className="flex gap-1 items-center cursor-pointer"
            >
              {isFavorited ? (
                <div className="flex gap-1 items-center">
                  <StarIcon className="w-4 h-4" /> Bỏ Duyệt
                </div>
              ) : (
                <div className="flex gap-1 items-center">
                  <StarHalf className="w-4 h-4" /> Duyệt
                </div>
              )}
            </DropdownMenuItem>

            <Protect
              condition={(check) => {
                return (
                  check({
                    role: "org:admin",
                  }) || file.userId === me?._id
                );
              }}
              fallback={<></>}
            >
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (file.shouldDelete) {
                    restoreFile({
                      fileId: file._id,
                    });
                  } else {
                    setIsConfirmOpen(true);
                  }
                }}
                className="flex gap-1 items-center cursor-pointer"
              >
                {file.shouldDelete ? (
                  <div className="flex gap-1 text-green-600 items-center cursor-pointer">
                    <UndoIcon className="w-4 h-4" /> Khôi phục
                  </div>
                ) : (
                  <div className="flex gap-1 text-red-600 items-center cursor-pointer">
                    <TrashIcon className="w-4 h-4" /> Xóa
                  </div>
                )}
              </DropdownMenuItem>
            </Protect>
          </DropdownMenuContent>
        </DropdownMenu>

        <CommentModal onSubmit={handleCommentSubmit} />
      </Dialog>
    </>
  );
}
