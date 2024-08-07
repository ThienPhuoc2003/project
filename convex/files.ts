import { ConvexError, v } from "convex/values";
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { getUser } from "./users";
2;
import { fileTypes } from "./schema";
import { Doc, Id } from "./_generated/dataModel";
//tác dụng tạo một URL tạm thời cho phép người dùng đã đăng nhập tải tệp lên hệ thống lưu trữ. Nếu người dùng chưa đăng nhập, hàm sẽ ném ra một lỗi để ngăn chặn việc tạo URL.
export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("bạn phải đăng nhập để tải lên 1 đề thi");
  }

  return await ctx.storage.generateUploadUrl();
});

export const getDownloadUrl = mutation({
  args: {
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const downloadUrl = await ctx.storage.getUrl(args.fileId);
    const data = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("fileId"), args.fileId))
      .first();
    return { downloadUrl, ...data };
  },
});

export async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  orgId: string
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    return null;
  }

  const hasAccess =
    user.orgIds.some((item) => item.orgId === orgId) ||
    user.tokenIdentifier.includes(orgId);

  if (!hasAccess) {
    return null;
  }

  return { user };
}

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: fileTypes,
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAccess) {
      throw new ConvexError("bạn không có quyền truy cập vào tổ chức này!");
    }

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type,
      userId: hasAccess.user._id,
      comments: [],
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
    query: v.optional(v.string()),
    favorites: v.optional(v.boolean()),
    deletedOnly: v.optional(v.boolean()),
    type: v.optional(fileTypes),
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAccess) {
      return [];
    }

    let files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const query = args.query;

    if (query) {
      files = files.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (args.favorites) {
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_userId_orgId_fileId", (q) =>
          q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
        )
        .collect();

      files = files.filter((file) =>
        favorites.some((favorite) => favorite.fileId === file._id)
      );
    }

    if (args.deletedOnly) {
      files = files.filter((file) => file.shouldDelete);
    } else {
      files = files.filter((file) => !file.shouldDelete);
    }

    if (args.type) {
      files = files.filter((file) => file.type === args.type);
    }

    const filesWithUrl = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.fileId),
      }))
    );

    return filesWithUrl;
  },
});

export const deleteAllFiles = internalMutation({
  args: {},
  async handler(ctx) {
    const files = await ctx.db
      .query("files")
      .withIndex("by_shouldDelete", (q) => q.eq("shouldDelete", true))
      .collect();

    await Promise.all(
      files.map(async (file) => {
        await ctx.storage.delete(file.fileId);
        return await ctx.db.delete(file._id);
      })
    );
  },
});

function assertCanDeleteFile(user: Doc<"users">, file: Doc<"files">) {
  const canDelete =
    file.userId === user._id ||
    user.orgIds.find((org) => org.orgId === file.orgId)?.role === "admin";

  if (!canDelete) {
    throw new ConvexError("bạn không có quyền xóa tập tin này!");
  }
}

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("không có quyền truy cập vào tập tin");
    }

    assertCanDeleteFile(access.user, access.file);

    await ctx.db.patch(args.fileId, {
      shouldDelete: true,
    });
  },
});

export const restoreFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("không có quyền truy cập vào tập tin");
    }

    assertCanDeleteFile(access.user, access.file);

    await ctx.db.patch(args.fileId, {
      shouldDelete: false,
    });
  },
});

export const toggleFavorite = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("không có quyền truy cập vào tập tin");
    }
    if (
      !access.user.orgIds.find(
        (org) => org.orgId === access.file.orgId && org.role === "admin"
      )
    ) {
      throw new ConvexError("Chỉ trưởng bộ môn mới được duyệt ");
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
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAccess) {
      return [];
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
      )
      .collect();

    return favorites;
  },
});

async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"files">
) {
  const file = await ctx.db.get(fileId);

  if (!file) {
    return null;
  }

  const hasAccess = await hasAccessToOrg(ctx, file.orgId);

  if (!hasAccess) {
    return null;
  }

  return { user: hasAccess.user, file };
}

function assertCanCommentFile(user: Doc<"users">, file: Doc<"files">) {
  const canComment =
    file.userId === user._id ||
    user.orgIds.find((org) => org.orgId === file.orgId)?.role === "admin";

  if (!canComment) {
    throw new ConvexError("Bạn không có quyền bình luận về tập tin này!");
  }
}

export const addCommentToFile = mutation({
  args: {
    fileId: v.id("files"),
    userId: v.id("users"),
    commentText: v.string(),
  },
  async handler(ctx, { fileId, userId, commentText }) {
    if (!commentText.trim()) {
      throw new ConvexError("Nội dung bình luận không được để trống!");
    }
    const timestamp = Date.now();
    await ctx.db.patch(fileId, {
      comments: [{ userId, text: commentText, createdAt: Date.now() }],
    });
  },
});
export const getCommentsByFileId = query({
  args: { fileId: v.id("files") },
  async handler(ctx, { fileId }) {
    const file = await ctx.db.get(fileId);
    if (!file) {
      throw new Error("File not found.");
    }

    // Kiểm tra xem file có bình luận không
    const comments = file.comments || [];

    // Lấy thông tin người dùng cho mỗi bình luận
    const commentsWithUserNames = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId); // Giả sử có một hàm getUser trong ctx.db để lấy thông tin người dùng
        return {
          createdAt: new Date(comment.createdAt).toLocaleString(), // Chuyển timestamp thành chuỗi ngày giờ địa phương
          text: comment.text,
          userName: user ? user.name : "Unknown User", // Trả về tên người dùng hoặc "Unknown User" nếu không tìm thấy
        };
      })
    );

    return commentsWithUserNames;
  },
});

export const getAnalyticsData = query(async (ctx) => {
  const files = await ctx.db.query("files").collect();
  const favorites = await ctx.db.query("favorites").collect();

  return [files, favorites].flat().map((data) => ({
    createdAt: data._creationTime,
    isFile: "type" in data && typeof data.type !== "undefined",
  }));
});

// Truy vấn để lấy tất cả các tệp
export const getAllFiles = query(async ({ db }) => {
  return await db.query("files").collect();
});
