import { SignInButton, useUser } from "@clerk/nextjs";
import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import CreateReplyWizard from "~/components/CreateReplyWizard";
import PostView from "~/components/PostView";
import RepliesFeed from "~/components/RepliesFeed";
import { LoadingPage } from "~/components/Spinner";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

const PostDetailPage: NextPage<{ id: string }> = ({ id }) => {
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
    <>
      <Head>
        <title>Aubergine - Post</title>
      </Head>
      <div className="flex flex-col">
        <PostView postData={postData} />
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
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.posts.getPostById.prefetch({ postId: id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default PostDetailPage;
