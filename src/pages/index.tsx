import { SignInButton, useUser } from "@clerk/nextjs";
import CreatePostWizard from "~/components/CreatePostWizard";
import GeneralFeed from "~/components/GeneralFeed";
import { api } from "~/utils/api";

const Home = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  if (!userLoaded) {
    return <div />;
  }
  return (
    <>
      <div className="border-b border-slate-600  p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton mode="modal">
              <button className="rounded border border-violet-400 p-2">
                Sign in to post
              </button>
            </SignInButton>
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>
      <GeneralFeed />
    </>
  );
};

export default Home;
