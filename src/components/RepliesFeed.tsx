import { api } from "~/utils/api";
import { LoadingPage } from "./Spinner";
import PostView from "./PostView";

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
        <PostView key={replyData.post.id} postData={replyData} />
      ))}
    </div>
  );
};

export default RepliesFeed;
