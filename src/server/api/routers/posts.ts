import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { filterUserForClient } from "~/helpers";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { ChripSchema, ReplySchema } from "~/types";

export const postsRouter = createTRPCRouter({
  getPostById: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Post not found",
        });
      }

      const author = await clerkClient.users.getUser(post.authorId);

      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for post not found",
        });
      }

      return {
        post,
        author: {
          ...filterUserForClient(author),
        },
      };
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      where: {
        isReply: false,
      },
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for post not found",
        });
      }

      return {
        post,
        author: {
          ...author,
          username: author.username,
        },
      };
    });
  }),
  create: privateProcedure
    .input(ChripSchema)
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });
      return post;
    }),
  reply: privateProcedure
    .input(ReplySchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { content } = input;

      const reply = await ctx.prisma.post.create({
        data: {
          isReply: true,
          authorId: userId,
          content: content,
          replyPostId: input.postId,
        },
      });

      return reply;
    }),
  getRepliesForPost: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          replyPostId: input.postId,
        },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: posts.map((post) => post.authorId),
          limit: 100,
        })
      ).map(filterUserForClient);

      return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorId);

        if (!author) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Author for post not found",
          });
        }

        return {
          post,
          author: {
            ...author,
            username: author.username,
          },
        };
      });
    }),
  getLikesForPost: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.userId;
      const posts = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
        include: {
          likes: true,
        },
      });

      const likeBySelf = posts?.likes.filter(
        (like) => like.userId === currentUserId
      );
      const isLikedBySelf = likeBySelf && likeBySelf.length > 0;

      return { likesCount: posts?.likes.length || 0, isLikedBySelf };
    }),
  like: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { prisma } = ctx;
      const { postId } = input;
      const authorId = ctx.userId;

      return prisma.like.create({
        data: {
          userId: authorId,
          post: {
            connect: {
              id: postId,
            },
          },
        },
      });
    }),
  unlike: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { prisma } = ctx;
      const { postId } = input;
      const authorId = ctx.userId;

      return prisma.like.delete({
        where: {
          postId_userId: {
            postId,
            userId: authorId,
          },
        },
      });
    }),
  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { userId } = input;

      const author = await clerkClient.users.getUser(userId);

      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for post not found",
        });
      }

      const posts = await prisma.post.findMany({
        where: {
          authorId: userId,
        },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
      });

      return posts.map((post) => {
        return {
          post,
          author: {
            ...filterUserForClient(author),
          },
        };
      });
    }),
});
