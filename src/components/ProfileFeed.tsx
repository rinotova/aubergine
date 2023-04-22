import { type PostWithUser } from "~/types";
import PostView from "./PostView";

const ProfileFeed = ({ postsByUser }: { postsByUser: PostWithUser[] }) => {
  return (
    <div className="flex flex-col">
      {postsByUser.map((postData) => (
        <PostView key={postData.post.id} postData={postData} />
      ))}
    </div>
  );
};

export default ProfileFeed;
