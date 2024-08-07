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
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = async () => {
    try {
      await onSubmit(comment);  // Assuming onSubmit can be asynchronous
      setSuccessMessage("Bình luận đã được gửi thành công!");
      setErrorMessage(""); // Clear any previous error messages
    } catch (error) {
      setErrorMessage("Đã xảy ra lỗi khi gửi bình luận.");
      setSuccessMessage(""); // Clear any previous success messages
    }
    setOpen(false); // Close modal after submit
    setComment(""); // Clear the input field after submit
  };
  return (
    <>
            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Nhập bình luận</DialogTitle>
            <DialogDescription>
            Hãy bình luận, góp ý vào đây !
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
            {successMessage && <p className="text-green-500">{successMessage}</p>}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
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
