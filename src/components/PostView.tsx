import Image from "next/image";
import { type PostWithUser } from "~/types";
import dayjs from "dayjs";
import relativetime from "dayjs/plugin/relativeTime";

dayjs.extend(relativetime);

const PostView = ({ postData }: { postData: PostWithUser }) => {
  const { post, author } = postData;
  return (
    <div className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt="Profile image"
        width={56}
        height={56}
        className="rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex gap-1 font-bold text-slate-300">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{` · ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};

export default PostView;
