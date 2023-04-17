import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getUsername } from "~/helpers";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { ChripSchema, ReplySchema } from "~/types";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: getUsername(user.emailAddresses, user.username, user.firstName),
    profileImageUrl: user.profileImageUrl,
  };
};

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
      const { content, postId } = input;

      const reply = await ctx.prisma.reply.create({
        data: {
          post: {
            connect: {
              id: postId,
            },
          },
          authorId: userId,
          content: content,
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
      const replies = await ctx.prisma.reply.findMany({
        where: {
          postId: input.postId,
        },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: replies.map((post) => post.authorId),
          limit: 100,
        })
      ).map(filterUserForClient);

      return replies.map((post) => {
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
});
