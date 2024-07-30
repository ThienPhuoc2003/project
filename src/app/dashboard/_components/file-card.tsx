import React, { ReactNode, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ImageIcon,
  FileTextIcon,
  GanttChartIcon,
  TextIcon,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Doc } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileCardActions } from "./file-actions";
import { useQuery } from "convex/react";

export function FileCard({
  file,
}: {
  file: Doc<"files"> & { isFavorited: boolean; url: string | null };
}) {
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });

  const typeIcons: Record<Doc<"files">["type"], ReactNode> = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    csv: <GanttChartIcon />,
    docx: <TextIcon />,
  };

  const icon = typeIcons[file.type];
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 text-base font-normal">
          <div className="flex justify-center">{typeIcons[file.type]}</div>{" "}
          {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardActions isFavorited={file.isFavorited} file={file} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type === "image" && file.url && (
          <Image alt={file.name} width="600" height="800" src={file.url} />
        )}
        {/* {file.type === "image" 
        && (
          <Image
            unoptimized
            alt={file.name}
            width="200"
            height="200"
            src={file.url}
          />
        )
        } */}
        {file.type == "docx" && <TextIcon className="w-20 h-20" />}
        {file.type == "csv" && <GanttChartIcon className="w-20 h-20" />}
        {file.type == "pdf" && <FileTextIcon className="w-20 h-20" />}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
        <div className="text-xs text-gray-700">
          Uploaded on {format(new Date(file._creationTime), "dd/MM/yyyy")} at{" "}
          {format(new Date(file._creationTime), "HH:mm")}
        </div>
      </CardFooter>
    </Card>
  );
}
