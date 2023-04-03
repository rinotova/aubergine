import type { EmailAddress, User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const getUsername = (emailAddresses: EmailAddress[]) => {
  for (let index = 0; index < emailAddresses.length; index++) {
    const email = emailAddresses[index];
    if (email?.emailAddress) {
      return email.emailAddress.split("@")[0];
    }
  }
  return "User";
};

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username:
      user.username ||
      user.firstName ||
      getUsername(user.emailAddresses) ||
      "User",
    profileImageUrl: user.profileImageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
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
});
