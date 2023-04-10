import Image from "next/image";
import useCreateChirp from "~/hooks/useCreateChirp";

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
        <button disabled={!(emoji !== "" && !isPosting)} type="submit">
          Post
        </button>
      </form>
    </>
  );
};

export default CreatePostWizard;
