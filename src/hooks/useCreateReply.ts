import { useUser } from "@clerk/nextjs";
import { type EmailAddress } from "@clerk/nextjs/dist/api";
import { TRPCClientError } from "@trpc/client";
import { useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import { getUsername, isValidEmoji } from "~/helpers";
import { type Reply } from "~/types";
import { api } from "~/utils/api";

function useCreateReply(postId: string) {
  const { user } = useUser();
  const [emoji, setEmoji] = useState("");
  const trpcUtils = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.reply.useMutation({
    onMutate: async (newPost) => {
      if (!user) {
        return;
      }

      const rateResponse = await fetch("/api/is-rate-limited");
      const rateResponseJson = (await rateResponse.json()) as unknown as {
        isPassedDBRateLimit: boolean;
      };
      if (!rateResponseJson.isPassedDBRateLimit) {
        throw new TRPCClientError("Failed post! Please try again later.");
      }

      // Cancel any outgoing refetches so they don't overwrite our optimistic update.
      await trpcUtils.posts.getRepliesForPost.cancel();

      // Snapshot of the previous value
      const previousReplies = trpcUtils.posts.getRepliesForPost.getData();

      // Optimistically update to the new value
      trpcUtils.posts.getRepliesForPost.setData({ postId }, (prev) => {
        const optimisticReply: Reply = {
          post: {
            id: "optimisticPostId",
            createdAt: new Date(Date.now()),
            authorId: user.id,
            content: newPost.content,
            replyPostId: postId,
            isReply: true,
          },
          author: {
            id: user.id,
            profileImageUrl: user.profileImageUrl,
            username: getUsername(
              user.emailAddresses as EmailAddress[],
              user.username,
              user.firstName
            ),
          },
        };
        if (!prev) {
          return [optimisticReply];
        }
        return [optimisticReply, ...prev];
      });
      setEmoji("");
      return { previousReplies };
    },
    onError: (err, newPost, context) => {
      toast.dismiss();
      toast.error(err.message);
      setEmoji(newPost.content);
      trpcUtils.posts.getRepliesForPost.setData(
        { postId },
        () => context?.previousReplies
      );
    },
    onSettled: () => {
      void trpcUtils.posts.getRepliesForPost.invalidate();
    },
  });

  const createChirp = (e: FormEvent) => {
    e.preventDefault();

    if (!isValidEmoji(emoji)) {
      toast.dismiss();
      toast.error("You can only post emojies for a max of 280 characters.");
      return;
    }

    mutate({ postId, content: emoji });
  };

  return {
    user,
    createChirp,
    isPosting,
    emoji,
    setEmoji,
  };
}

export default useCreateReply;
