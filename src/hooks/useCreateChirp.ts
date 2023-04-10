import { useUser } from "@clerk/nextjs";
import { type EmailAddress } from "@clerk/nextjs/dist/api";
import { useState, type FormEvent } from "react";
import { getUsername } from "~/helpers";
import { ChripSchema, type Post } from "~/types";
import { api } from "~/utils/api";

function useCreateChirp() {
  const { user } = useUser();
  const [emoji, setEmoji] = useState("");
  const trpcUtils = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onMutate: async (newPost) => {
      if (!user) {
        return;
      }
      // Cancel any outgoing refetches so they don't overwrite our optimistic update.
      await trpcUtils.posts.getAll.cancel();

      // Snapshot of the previous value
      const previousPosts = trpcUtils.posts.getAll.getData();

      // Optimistically update to the new value
      trpcUtils.posts.getAll.setData(undefined, (prev) => {
        const optimisticPost: Post = {
          post: {
            id: "optimisticPostId",
            createdAt: new Date(Date.now()),
            authorId: user.id,
            content: newPost.content,
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
          return [optimisticPost];
        }
        return [optimisticPost, ...prev];
      });
      setEmoji("");
      return { previousTodos: previousPosts };
    },
    onError: (err, newPost, context) => {
      setEmoji(newPost.content);
      trpcUtils.posts.getAll.setData(undefined, () => context?.previousTodos);
    },
    onSettled: () => {
      void trpcUtils.posts.getAll.invalidate();
    },
  });

  const createChirp = (e: FormEvent) => {
    e.preventDefault();
    if (isPosting) {
      return;
    }

    try {
      ChripSchema.parse({ content: emoji });
    } catch (e) {
      return;
    }
    mutate({ content: emoji });
  };

  return {
    user,
    createChirp,
    isPosting,
    emoji,
    setEmoji,
  };
}

export default useCreateChirp;
