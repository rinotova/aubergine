import PostForm from "./PostForm";
import useCreateReply from "~/hooks/useCreateReply";

const CreateReplyWizard = ({ postIdReply }: { postIdReply: string }) => {
  const { user, createAubergine, isPosting, emoji, setEmoji } =
    useCreateReply(postIdReply);

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

export default CreateReplyWizard;
