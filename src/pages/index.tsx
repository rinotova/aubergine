import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import CreatePostWizard from "~/components/CreatePostWizard";
import Feed from "~/components/GeneralFeed";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  if (!userLoaded) {
    return <div />;
  }
  return (
    <>
      <div className="border-b border-t-4 border-slate-600 border-t-violet-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </>
  );
};

export default Home;
