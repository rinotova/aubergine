import Image from "next/image";
import { type ReplyWithUser, type PostWithUser } from "~/types";
import dayjs from "dayjs";
import relativetime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./Spinner";
import Heart from "./icons/Heart";
import Message from "./icons/Message";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";

dayjs.extend(relativetime);

const PostView = ({ postData }: { postData: PostWithUser | ReplyWithUser }) => {
  const router = useRouter();
  console.log(router);
  const isPostDetailPage = router.pathname.includes("/post/");
  const [isLiking, setIsLiking] = useState(false);
  const trpcUtils = api.useContext();

  const { data: postReplies, isLoading: repliesLoading } =
    api.posts.getRepliesForPost.useQuery({
      postId: postData.post.id,
    });

  const { data: postLikes, isLoading: likesLoading } =
    api.posts.getLikesForPost.useQuery({
      postId: postData.post.id,
    });

  const { mutate: executeLike } = api.posts.like.useMutation({
    onSettled: async () => {
      await trpcUtils.posts.getLikesForPost.invalidate();
      setIsLiking(false);
    },
    onError: (e) => {
      toast.dismiss();
      toast.error(e.message);
    },
  });

  const { mutate: executeUnlike } = api.posts.unlike.useMutation({
    onSettled: async () => {
      await trpcUtils.posts.getLikesForPost.invalidate();
      setIsLiking(false);
    },
    onError: (e) => {
      toast.dismiss();
      toast.error(e.message);
    },
  });

  const { post, author } = postData;
  const username = `@${author.username}`;

  function likeHandler() {
    if (isLiking) {
      return;
    }
    setIsLiking(true);
    executeLike({ postId: post.id });
  }

  function unLikeHandler() {
    if (isLiking) {
      return;
    }
    setIsLiking(true);
    executeUnlike({ postId: post.id });
  }

  const hasLikes = postLikes?.likesCount ? postLikes?.likesCount > 0 : false;

  return (
    <div className="flex gap-3 border-b border-slate-600 p-4">
      <Image
        src={author.profileImageUrl}
        alt="Profile image"
        width={50}
        height={50}
        className="h-fit rounded-full"
      />
      <div className="flex w-full flex-col">
        <div className="flex gap-1 font-bold text-slate-300">
          <a href={`/${username}`}>
            <span>{username}</span>
          </a>
          <a href={`/post/${post.id}`}>
            <span className="font-thin">{` · ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </a>
        </div>
        <span className="mt-3 break-all text-2xl">{post.content}</span>

        <div className="mt-3 grid h-9 grid-flow-col grid-rows-1 justify-end gap-7 text-sm">
          {repliesLoading && <LoadingSpinner />}
          {!repliesLoading && (
            <div className="flex w-10">
              {isPostDetailPage ? (
                <span>
                  <Message
                    hasMessages={!!(postReplies && postReplies.length > 0)}
                  />
                </span>
              ) : (
                <a href={`/post/${post.id}`}>
                  <Message
                    hasMessages={!!(postReplies && postReplies.length > 0)}
                  />
                </a>
              )}

              <span>{postReplies?.length}</span>
            </div>
          )}

          <div className="flex w-10 justify-end">
            {likesLoading || isLiking ? (
              <LoadingSpinner />
            ) : (
              <>
                <button
                  onClick={
                    postLikes?.isLikedBySelf ? unLikeHandler : likeHandler
                  }
                >
                  {postLikes?.isLikedBySelf ? (
                    <Heart isFilled={true} hasLikes={true} />
                  ) : (
                    <Heart hasLikes={hasLikes} />
                  )}
                </button>

                <span className="-ml-1">{postLikes?.likesCount}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostView;
