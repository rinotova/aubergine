import { api } from "~/utils/api";
import PostView from "./PostView";
import { LoadingPage } from "./Spinner";

const GeneralFeed = () => {
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

export default GeneralFeed;
