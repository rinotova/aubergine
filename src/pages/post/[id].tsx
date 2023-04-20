import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import CreateReplyWizard from "~/components/CreateReplyWizard";
import PostView from "~/components/PostView";
import RepliesFeed from "~/components/RepliesFeed";
import { LoadingPage } from "~/components/Spinner";
import { api } from "~/utils/api";

const PostDetailPage: NextPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { data: postData, isLoading: postsLoading } =
    api.posts.getPostById.useQuery(
      {
        postId: id,
      },
      { enabled: !!id }
    );
  const { isSignedIn } = useUser();

  if (postsLoading) {
    return <LoadingPage />;
  }

  if (!postData) {
    return <div>Something went wrong</div>;
  }
  const postId = postData.post.id;

  return (
    <div className="flex flex-col">
      <PostView postData={postData} isPostDetailPage={true} />
      <div className="border-b border-slate-600 p-4">
        {isSignedIn && <CreateReplyWizard postIdReply={postId} />}
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton mode="modal">
              <button className="rounded border border-violet-400 p-2">
                Sign in to reply
              </button>
            </SignInButton>
          </div>
        )}
      </div>
      <RepliesFeed postId={postId} />
    </div>
  );
};

export default PostDetailPage;
