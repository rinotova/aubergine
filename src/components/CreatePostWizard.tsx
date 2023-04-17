import useCreateChirp from "~/hooks/useCreateChirp";
import PostForm from "./PostForm";

const CreatePostWizard = () => {
  const { user, createChirp, isPosting, emoji, setEmoji } = useCreateChirp();

  if (!user) {
    return null;
  }

  const postFormProps = {
    createChirp,
    isPosting,
    emoji,
    setEmoji,
    profileImageUrl: user.profileImageUrl,
  };

  return <PostForm {...postFormProps} />;
};

export default CreatePostWizard;
