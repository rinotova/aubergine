import useCreateAubergine from "~/hooks/useCreateAubergine";
import PostForm from "./PostForm";

const CreatePostWizard = () => {
  const { user, createAubergine, isPosting, emoji, setEmoji } =
    useCreateAubergine();

  if (!user) {
    return null;
  }

  const postFormProps = {
    createAubergine,
    isPosting,
    emoji,
    setEmoji,
    profileImageUrl: user.profileImageUrl,
  };

  return <PostForm {...postFormProps} />;
};

export default CreatePostWizard;
