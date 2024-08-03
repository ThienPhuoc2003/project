'use client'
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileIcon, StarIcon, TrashIcon } from "lucide-react";
import clsx from "clsx";

export function SideNav() {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleNav = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={clsx("flex flex-col", { "w-40": isExpanded, "w-10": !isExpanded }, "transition-width duration-300 ease-in-out")}>
      <Button onClick={toggleNav} className="mb-2">
        {isExpanded ? '<<' : '>>'}
      </Button>
      <Link href="/dashboard/files">
        <Button variant={"link"} className="flex items-center gap-2">
          <FileIcon className="w-5 h-5" /> {isExpanded && "Tất cả các tập tin"}
        </Button>
      </Link>
      <Link href="/dashboard/favorites">
        <Button variant={"link"} className="flex items-center gap-2">
          <StarIcon className="w-5 h-5" /> {isExpanded && "Yêu thích"}
        </Button>
      </Link>
      <Link href="/dashboard/trash">
        <Button variant={"link"} className="flex items-center gap-2">
          <TrashIcon className="w-5 h-5" /> {isExpanded && "Rác"}
        </Button>
      </Link>
    </div>
  );
}