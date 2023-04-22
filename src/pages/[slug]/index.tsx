import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { LoadingPage } from "~/components/Spinner";
import ProfileFeed from "~/components/ProfileFeed";
import { clerkClient } from "@clerk/nextjs/server";
import { type User } from "@clerk/nextjs/dist/api";

const ProfilePage: NextPage<{ userEmail: string }> = ({ userEmail }) => {
  const { data: currentUser } = api.profile.getUserByEmail.useQuery({
    userEmail,
  });

  if (!currentUser) return <div>404</div>;

  const { data: postsByUser, isLoading: arePostsLoading } =
    api.posts.getPostsByUserId.useQuery(
      {
        userId: currentUser.id,
      },
      { enabled: !!(currentUser && currentUser.id) }
    );

  return (
    <>
      <Head>
        <title>{currentUser.username}</title>
      </Head>

      <div className="relative h-36 bg-slate-600">
        <Image
          src={currentUser.profileImageUrl}
          alt={`${currentUser.username}'s profile pic`}
          width={128}
          height={128}
          className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
        />
      </div>
      <div className="h-[64px]"></div>
      <div className="p-4 text-2xl font-bold">{`@${currentUser.username}`}</div>
      <div className="w-full border-b border-slate-400" />
      {arePostsLoading && <LoadingPage />}
      {!arePostsLoading && postsByUser && (
        <ProfileFeed postsByUser={postsByUser} />
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const getUserEmail = (user: User, username: string): string | undefined => {
    const emailAddresses = user.emailAddresses;
    const theEmail = emailAddresses.find((emailAddressObj) => {
      const emailFromUsername = emailAddressObj.emailAddress.split("@")[0];
      if (emailFromUsername === username) {
        return emailFromUsername;
      }
      return "";
    });
    return theEmail?.emailAddress;
  };

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");
  const users = await clerkClient.users.getUserList();

  let theFinalEmail;
  users.find((user) => {
    const theEmail = getUserEmail(user, username);
    if (theEmail) {
      theFinalEmail = theEmail;
    }
  });

  if (!theFinalEmail) {
    throw new Error("no user");
  }

  await ssg.profile.getUserByEmail.prefetch({ userEmail: theFinalEmail });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      userEmail: theFinalEmail,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
