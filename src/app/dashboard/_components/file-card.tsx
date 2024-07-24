import React, { ReactNode, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ImageIcon,
  FileTextIcon,
  GanttChartIcon,
  MoreVertical,
  TrashIcon,
  TextIcon,
  StarIcon,
  StarHalf,
} from "lucide-react";
import Image from "next/image";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

function FileCardAction({ file,isFavorited }: { file: Doc<"files">,isFavorited:boolean }) {
  const deleteFile = useMutation(api.files.deleteFile);
  const toggleFavorite = useMutation (api.files.toggleFavorite); 
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({ fileId: file._id });
                toast({
                  variant: "default",
                  title: "File Deleted",
                  description: "Your file is now gone from the system",
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
        <DropdownMenuItem
            onClick={()=>{
              toggleFavorite({
                fileId:file._id,
              })
            }}
            className="flex gap-1 items-center cursor-pointer">
              {isFavorited?(
              <div className="flex gap-1 items-center">
              <StarIcon className="w-4 h-4"/>Unfavorite
              </div>
              ):(
                <div className="flex gap-1 items-center">
            <StarHalf className="w-4 h-4" />Favorite
            </div>
            )}
          </DropdownMenuItem>
              <DropdownMenuSeparator/>
          <DropdownMenuItem
            onClick={() => setIsConfirmOpen(true)}
            className="flex gap-1 text-red-600 items-center cursor-pointer"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function getFileUrl(fileId: Id<"_storage">) {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

export function FileCard({
  file,favorites}: {file: Doc<"files"> & { downloadUrl: string };favorites:Doc<"favorites">[];
}) {
  const typeIcons: Record<Doc<"files">["type"], ReactNode> = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    csv: <GanttChartIcon />,
    docx: <TextIcon />, // Corrected key
  };

  const icon = typeIcons[file.type];

  //const isFavorited= favorites.some((favorite)=>favorite.fileId === file._id);
  const isFavorited = favorites ? favorites.some((favorite) => favorite.fileId === file._id) : false;
  

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2">
          {icon}
          {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardAction isFavorited={isFavorited}  file={file} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type === "image" && (
          <Image
            unoptimized
            alt={file.name}
            width="200"
            height="200"
            src={file.downloadUrl}
          />
        )}
        {file.type == "docx" && <TextIcon className="w-20 h-20" />}
        {file.type == "csv" && <GanttChartIcon className="w-20 h-20" />}
        {file.type == "pdf" && <FileTextIcon className="w-20 h-20" />}
      </CardContent>
      <CardFooter className="flex justify-center">
        <a href={file.downloadUrl} download={file.name} target="_blank">
          <Button>Download</Button>
        </a>
        {/* <Button onClick={() => {
  window.open(getFileUrl(file.fileId),"_blank");
}}>Download</Button> */}
      </CardFooter>
    </Card>
  );
}
