import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativetime from "dayjs/plugin/relativeTime";
import { LoadingPage, LoadingSpinner } from "~/components/Spinner";
import { type FormEvent, useState, useRef, useEffect } from "react";
import { ChripSchema, type Post } from "~/types";
import { getUsername } from "~/helpers";
import { type EmailAddress } from "@clerk/nextjs/dist/api";
import EmojiPicker, { Theme } from "emoji-picker-react";

dayjs.extend(relativetime);

const CreatePostWizard = () => {
  const [emoji, setEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const trpcUtils = api.useContext();

  useEffect(() => {
    const documentClickHandler = (e: MouseEvent) => {
      if (
        e.target &&
        e.target instanceof HTMLElement &&
        !e.target.closest(".js-emojiInput")
      ) {
        setShowEmojiPicker(!!e.target.closest(".js-emojiPickerWrapper"));
      }
    };

    document.addEventListener("click", documentClickHandler);

    return () => document.removeEventListener("click", documentClickHandler);
  }, []);

  if (!user) {
    return null;
  }

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update.
      await trpcUtils.posts.getAll.cancel();

      // Snapshot of the previous value
      const previousPosts = trpcUtils.posts.getAll.getData();

      // Optimistically update to the new value
      trpcUtils.posts.getAll.setData(undefined, (prev) => {
        const optimisticPost: Post = {
          post: {
            id: "optimisticPostId",
            createdAt: new Date(Date.now()),
            authorId: user.id,
            content: newPost.content,
          },
          author: {
            id: user.id,
            profileImageUrl: user.profileImageUrl,
            username: getUsername(
              user.emailAddresses as EmailAddress[],
              user.username,
              user.firstName
            ),
          },
        };
        if (!prev) {
          return [optimisticPost];
        }
        return [optimisticPost, ...prev];
      });
      setEmoji("");
      return { previousTodos: previousPosts };
    },
    onError: (err, newPost, context) => {
      setEmoji(newPost.content);
      trpcUtils.posts.getAll.setData(undefined, () => context?.previousTodos);
    },
    onSettled: () => {
      void trpcUtils.posts.getAll.invalidate();
    },
  });

  const createChirp = (e: FormEvent) => {
    e.preventDefault();
    if (isPosting) {
      return;
    }

    try {
      ChripSchema.parse({ content: emoji });
    } catch (e) {
      return;
    }
    mutate({ content: emoji });
  };

  return (
    <>
      <form className="flex w-full gap-3" onSubmit={createChirp}>
        <Image
          src={user.profileImageUrl}
          alt="Profile image"
          width={56}
          height={56}
          className="rounded-full"
        />
        <input
          onChange={(e) => setEmoji(e.target.value)}
          onFocus={() => setShowEmojiPicker(true)}
          value={emoji}
          type="text"
          placeholder="Type some emojis!"
          className="js-emojiInput grow bg-transparent outline-none"
          disabled={isPosting}
        />
        {emoji !== "" && !isPosting && <button type="submit">Post</button>}
        {isPosting && (
          <div className="flex items-center justify-center">
            <LoadingSpinner size={20} />
          </div>
        )}
      </form>
      <div
        ref={emojiPickerRef}
        className={
          "js-emojiPickerWrapper absolute top-24 left-0 right-0 mx-auto my-auto flex w-[348px] justify-center " +
          `${showEmojiPicker ? "block" : "hidden"}`
        }
      >
        <EmojiPicker
          theme={Theme.DARK}
          onEmojiClick={(emojiObj) =>
            setEmoji((prevValue) => prevValue + emojiObj.emoji)
          }
        />
      </div>
    </>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

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

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) {
    return <LoadingPage />;
  }

  if (!data) {
    return <div>Something went wrong</div>;
  }

  return (
    <div className="flex flex-col">
      {data.map((postData) => (
        <PostView key={postData.post.id} postData={postData} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  if (!userLoaded) {
    return <div />;
  }

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="border-b border-slate-400 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && <CreatePostWizard />}
          </div>

          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
