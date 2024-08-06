// Trong file CommentModal.tsx
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CommentModalProps {
  onSubmit: (comment: string) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ onSubmit }) => {
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    onSubmit(comment);
    setOpen(false); // Đóng modal sau khi submit
    setComment(""); // Xóa trường nhập sau khi submit
  };

  return (
    <>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="modal">
          <div className="modal-content">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhập bình luận của bạn..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Gửi Bình Luận</Button>

          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </>
  );
};

export default CommentModal; // Thêm dòng này để xuất khẩu mặc định
