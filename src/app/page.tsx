"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UploadButton } from "./dashboard/_components/upload-button";
import { FileCard } from "./dashboard/_components/file-card";
import { FileIcon, Loader2, StarIcon, Upload } from "lucide-react";
import Image from "next/image";
import { SearchBar } from "./dashboard/_components/search-bar";
import { SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  const [query ,setQuery]=useState("");

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
   //const files = useQuery(api.files.getFiles, orgId ? { orgId, query } : "skip");
  const isLoading = files === undefined;

  console.log(files)

  return (
    <main className="container mx-auto pt-12">
      <div className="flex gap-8">
      <div className="w-40 flex flex-col gap-4">
        <Link href="/dashboard/files">
          <Button variant={"link"} className="flex gap-2">
          <FileIcon/>All File
        </Button>
        </Link>
        
        <Link href="/dashboard/favorites"><Button variant={"link"} className="flex gap-2">
          <StarIcon/>Favorites File
        </Button>
        </Link>
      </div>
      <div className="w-full">
      {isLoading && (
        <div className="flex flex-col gap-8 items-center mt-24">
          <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
          <div className="text-2xl">Loading your images...</div>
        </div>
      )}
      {/* {!isLoading && !query && files.length === 0 && (
        <div className="flex flex-col gap-8 items-center mt-24">
          <Image
            alt="An image of a picture and directory icon"
            width="300"
            height="300"
            src="/empty.svg"
          />
          <div className="text-2xl">You have no files, upload one now</div>
          <UploadButton />
        </div>
              
      )} */}
      {!isLoading &&  (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Your Files</h1>
         {/* <SearchBar query={query} setQuery={setQuery}/> */}
            <UploadButton />
          </div>
     
          {files.length === 0 && (
        <div className="flex flex-col gap-8 items-center mt-24">
          <Image
            alt="An image of a picture and directory icon"
            width="300"
            height="300"
            src="/empty.svg"
          />
          <div className="text-2xl">You have no files, upload one now</div>
          <UploadButton />
        </div>
              
      )}


          <div className="grid grid-cols-4 gap-4">
            {" "}
            {/* Adjusted to display 4 items per row */}
            {files.map((file) => (
              <FileCard key={file._id} file={file} favorites={[]} />
            ))}
          </div>
        </>
      )}
      </div>
      </div>
    </main>
  );
}
