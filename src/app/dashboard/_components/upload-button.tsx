"use client";
import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import Image from "next/image";
import { api } from "../../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Doc } from "../../../../convex/_generated/dataModel";

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, "Required"),
});

export function UploadButton() {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const { toast } = useToast();
  const organization = useOrganization();
  const user = useUser();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const fileRef = form.register("file");

  const handleNotificationSelect = async (option: string) => {
    setShowNotificationMenu(false);

    const body = {
      orgId: organization.organization?.id,
      userId: user.user?.id,
      message: option,
    };

    const res = await fetch("/dashboard/notifications", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) return toast({ title: "Lỗi khi gửi thông báo!" });
 
    toast({ title: `Thông báo gửi thành công: ${option}` });
    // Additional logic based on the selected option
  };
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!orgId) return;

    const postUrl = await generateUploadUrl();

    const fileType = values.file[0].type;

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": fileType },
      body: values.file[0],
    });
    const { storageId } = await result.json();
    const types = {
      "image/png": "image",
      "application/pdf": "pdf",
      "text/csv": "csv",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
    } as Record<string, Doc<"files">["type"]>;
    try {
      await createFile({
        name: values.title,
        fileId: storageId,
        orgId,
        type: types[fileType],
      });

      form.reset();

      setIsFileDialogOpen(false);

      toast({
        variant: "success",
        title: "Tệp đã được tải lên",
        description:
          "Giờ đây mọi người trong tổ chức của bạn đều có thể xem tệp của bạn",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Có lỗi xảy ra",
        description: "Tệp của bạn không thể được tải lên, vui lòng thử lại sau",
      });
    }
  }

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const createFile = useMutation(api.files.createFile);

  return (
    <Dialog
      open={isFileDialogOpen}
      onOpenChange={(isOpen) => {
        setIsFileDialogOpen(isOpen);
        form.reset();
      }}
    >
      <Button onClick={() => setShowNotificationMenu(!showNotificationMenu)}>
        Thông báo
      </Button>

      {showNotificationMenu && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              zIndex: 1001,
            }}
          >
            <div
              onClick={() =>
                handleNotificationSelect("1.Thông báo mọi người gửi đề!")
              }
              style={{ padding: "10px", cursor: "pointer" }}
            >
              1.Thông báo mọi người gửi đề!
            </div>
            <div
              onClick={() =>
                handleNotificationSelect("2.Thông báo đã duyệt đề rồi!")
              }
              style={{ padding: "10px", cursor: "pointer" }}
            >
              2.Thông báo đã duyệt đề rồi!
            </div>
          </div>
        </div>
      )}

      <DialogTrigger asChild>
        <Button>Tải Tệp Lên</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-8">Tải Tệp Của Bạn Lên Đây</DialogTitle>
          <DialogDescription>
            Tệp này sẽ có thể truy cập bởi bất kỳ ai trong tổ chức của bạn
          </DialogDescription>
        </DialogHeader>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>Tệp</FormLabel>
                    <FormControl>
                      <Input type="file" {...fileRef} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex gap-1"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Gửi
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
