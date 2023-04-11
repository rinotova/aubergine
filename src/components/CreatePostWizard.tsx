import Image from "next/image";
import useCreateChirp from "~/hooks/useCreateChirp";
import { LoadingSpinner } from "./Spinner";

const CreatePostWizard = () => {
  const { user, createChirp, isPosting, emoji, setEmoji } = useCreateChirp();

  if (!user) {
    return null;
  }

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
    </>
  );
};

export default CreatePostWizard;
