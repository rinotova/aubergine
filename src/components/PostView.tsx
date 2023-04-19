import Image from "next/image";
import { ReplyWithUser, type PostWithUser } from "~/types";
import dayjs from "dayjs";
import relativetime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./Spinner";

dayjs.extend(relativetime);

const PostView = ({ postData }: { postData: PostWithUser | ReplyWithUser }) => {
  const { data: postReplies, isLoading: repliesLoading } =
    api.posts.getRepliesForPost.useQuery({
      postId: postData.post.id,
    });

  const { post, author } = postData;
  const username = `@${author.username}`;
  return (
    <div className="flex gap-3 border-b border-slate-600 p-4">
      <Image
        src={author.profileImageUrl}
        alt="Profile image"
        width={50}
        height={50}
        className="h-fit rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex gap-1 font-bold text-slate-300">
          <Link href={`/${username}`}>
            <span>{username}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{` · ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>
        <span className="break-all">{post.content}</span>
        <div>
          {repliesLoading && <LoadingSpinner />}
          {!repliesLoading && <p>Replies: {postReplies?.length}</p>}
        </div>
      </div>
    </div>
  );
};

export default PostView;
