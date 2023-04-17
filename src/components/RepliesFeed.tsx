import { api } from "~/utils/api";
import PostView from "./PostView";
import { LoadingPage } from "./Spinner";

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
      {postReplies.map((postData) => (
        <PostView key={postData.post.id} postData={postData} />
      ))}
    </div>
  );
};

export default RepliesFeed;
