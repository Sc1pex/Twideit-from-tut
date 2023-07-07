import { INFINITE_SCROLL_GET_COUNT } from "@/constants";
import { prisma } from "@/lib/db";
import PostFeed from "./PostFeed";

const GeneralFeed = async () => {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      postVotes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCROLL_GET_COUNT,
  });

  return <PostFeed initialPosts={posts} />;
};

export default GeneralFeed;
