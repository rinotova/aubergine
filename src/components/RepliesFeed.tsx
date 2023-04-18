import { api } from "~/utils/api";
import { LoadingPage } from "./Spinner";
import ReplyView from "./ReplyView";

const RepliesFeed = ({ postId }: { postId: string }) => {
  const { data: postReplies, isLoading: repliesLoading } =
    api.posts.getRepliesForPost.useQuery({
      postId,
    });

  if (repliesLoading) {
    return <LoadingPage />;
  }

  if (!postReplies) {
    return <div>Something went wrong</div>;
  }

  return (
    <div className="flex flex-col">
      {postReplies.map((replyData) => (
        <ReplyView key={replyData.post.id} replyData={replyData} />
      ))}
    </div>
  );
};

export default RepliesFeed;
