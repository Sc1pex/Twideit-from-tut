import { INFINITE_SCROLL_GET_COUNT } from "@/constants";
import { prisma } from "@/lib/db";
import PostFeed from "./PostFeed";
import { getAuthSession } from "@/lib/auth";

const CustomFeed = async () => {
  const session = await getAuthSession();

  const followedSubreddits = await prisma.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    select: {
      Subreddit: true,
    },
  });

  const posts = await prisma.post.findMany({
    where: {
      subreddit: {
        name: {
          in: followedSubreddits.map(({ Subreddit }) => Subreddit.id),
        },
      },
    },
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

export default CustomFeed;
