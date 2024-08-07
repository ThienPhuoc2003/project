import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";

type Params = {
  fileId: string;
};

export const GET = async (req: Request, context: { params: Params }) => {
  const file = await fetchMutation(api.files.getDownloadUrl, {
    // @ts-expect-error Unable to transform string to correct type
    fileId: context.params.fileId,
  });

  if (!file)
    return NextResponse.json(
      { error: { message: "Không tìm thấy tập tin" } },
      { status: 404 }
    );

  const res = await fetch(file.downloadUrl!);
  const data = await res.arrayBuffer();

  const type = file.type === "image" ? "image/png" : "application/" + file.type;

  return new Response(Buffer.from(data), {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${file.name + "." + file.type}"`,
    },
  });
};
