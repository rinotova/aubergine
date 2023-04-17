import { SignInButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { api } from "~/utils/api";
import CreatePostWizard from "./CreatePostWizard";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  if (!userLoaded) {
    return <div />;
  }
  return (
    <>
      <Head>
        <title>Aubergine</title>
        <meta name="description" content="Emojies only twitter" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-screen flex-col justify-center">
        <div className="mx-auto h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="border-b border-slate-400 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && <CreatePostWizard />}
          </div>
          {children}
        </div>
      </main>
    </>
  );
};

export default Layout;
