import Image from "next/image";
import React from "react";
import { LoadingSpinner } from "./Spinner";
import { type PostFormPropType } from "~/types";

function PostForm({ ...props }: PostFormPropType) {
  const { createChirp, isPosting, emoji, setEmoji, profileImageUrl } = props;
  return (
    <form className="flex w-full gap-3 " onSubmit={createChirp}>
      <Image
        src={profileImageUrl}
        alt="Profile image"
        width={50}
        height={50}
        className="rounded-full"
        priority={true}
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
  );
}

export default PostForm;
