import { getAuthSession } from "@/lib/auth";
import { Post, PostVote, VoteType } from "@prisma/client";
import { notFound } from "next/navigation";
import PostVoteClient from "./PostVoteClient";

interface PostVoteServerProps {
  postId: string;
  initialVote?: VoteType | null;
  initialVotesScore?: number;
  getData?: () => Promise<(Post & { postVotes: PostVote[] }) | null>;
}

const PostVoteServer = async ({
  postId,
  initialVotesScore,
  initialVote,
  getData,
}: PostVoteServerProps) => {
  const session = await getAuthSession();

  let votesScore = 0;
  let currentVote = undefined;

  if (getData) {
    const post = await getData();
    if (!post) {
      return notFound();
    }

    votesScore = post.postVotes.reduce((acc, vote) => {
      return acc + (vote.type === "UP" ? 1 : -1);
    }, 0);
    currentVote = post.postVotes.find(
      (vote) => vote.userId === session?.user.id
    )?.type;
  } else {
    votesScore = initialVotesScore!;
    currentVote = initialVote;
  }

  return (
    <PostVoteClient
      postId={postId}
      initialVotesScore={votesScore}
      initialVote={currentVote}
    />
  );
};

export default PostVoteServer;
