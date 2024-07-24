import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";
import { Id } from "./_generated/dataModel";
import { access } from "fs";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file");
  }
  return await ctx.storage.generateUploadUrl();
});

export const generateDownloadUrl = query({
  args: {
    fileId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("you must be logged in to download a file");
    }

    const file = await ctx.db
      .query("files")
      .filter((f) => f.eq(f.field("fileId"), args.fileId))
      .first();

    if (!file) {
      throw new ConvexError(`file not found with id ${args.fileId}`);
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      file.orgId
    );
    if (!hasAccess) {
      throw new ConvexError("you do not have access to this org");
    }

    return await ctx.storage.getUrl(file.fileId);
  },
});

async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  orgId: string
) {
  const identity = await ctx.auth.getUserIdentity();
    // console.log(identity);
    if (!identity) {
      return null;
    }
  const user =await ctx.db
  .query("users")
  .withIndex("by_tokenIdentifier",(q)=>
  q.eq("tokenIdentifier",identity.tokenIdentifier)).first();

  if(!user)
  {
    return null;
  }

  // const user = await getUser(ctx, tokenIdentifier);

  const hasAccess =
    user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);
    if(!hasAccess)
    {return null;}
    return {user};
  
}

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: fileTypes,
  },
  async handler(ctx, args) {
    // console.log(identity);
    const hasAccess = await hasAccessToOrg(ctx,args.orgId);
    
    if (!hasAccess) {
      throw new ConvexError("you do not have access to this org");
    }

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type,
      
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
    query: v.optional(v.string()),
    favorites: v.optional(v.boolean()),
  },
  async handler(ctx, args) {


    const hasAccess = await hasAccessToOrg(ctx,args.orgId);
    if (!hasAccess) {
      return [];
    }
//sua const thanh let
    let files = await Promise.all(
      (
        await ctx.db
          .query("files")
          .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
          .collect()
      ).map(async (data) => ({
        ...data,
        downloadUrl: (await ctx.storage.getUrl(data.fileId))!,
      }))
    );

    const query = args.query;
    if (query) {
   //sua retutn =files
      files= files.filter(file => file.name.includes(query.toLowerCase()));
    }
    // } else {
    //   return files;
    // };

    if(args.favorites)
    {
       const favorites = await ctx.db
       .query("favorites")
       .withIndex("by_userId_orgId_fileId",q=>
       q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
       )
       .collect();

       files=files.filter(file=>favorites.some((favorite)=>favorite.fileId=== file._id));
    }
    return files;
  },
});
export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);
    if(!access) {
      throw new ConvexError("no access to file");
    }
   
    await ctx.db.delete(args.fileId);
  },
});

export const toggleFavorite = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("no access to file");
    }

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q
          .eq("userId", access.user._id)
          .eq("orgId", access.file.orgId)
          .eq("fileId", access.file._id)
      )
      .first();

    if (!favorite) {
      await ctx.db.insert("favorites", {
        fileId: access.file._id,
        userId: access.user._id,
        orgId: access.file.orgId,
      });
    } else {
      await ctx.db.delete(favorite._id);
    }
  },
});


export const getAllFavorites = query({
  args: { orgId: v.string() },
  async handler(ctx, args) {
   
    const hasAccess = await hasAccessToOrg(ctx,args.orgId);

    if (!hasAccess) {
      return [];
    }
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q
          .eq("userId", hasAccess.user._id)
          .eq("orgId", args.orgId)
      ).collect();
      return favorites;
  }
}); 

async function hasAccessToFile(ctx:QueryCtx|MutationCtx,fileId:Id<"files">)
{    
    const file = await ctx.db.get(fileId);
    if (!file) {
      return null;
    }
    const hasAccess = await hasAccessToOrg(
      ctx,
      file.orgId
    );
    if (!hasAccess) {
  return null;
    }

    return {user:hasAccess.user,file};
}