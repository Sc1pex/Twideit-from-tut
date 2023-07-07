import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PostComment from "./PostComment";
import CreateComment from "./CreateComment";

interface CommentSectionProps {
  postId: string;
}

const CommentSection = async ({ postId }: CommentSectionProps) => {
  const session = await getAuthSession();

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    include: {
      author: true,
      commentVotes: true,
      replies: {
        include: {
          author: true,
          commentVotes: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />
      <CreateComment postId={postId} />

      <div className=" flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => comment.replyToId === null)
          .map((comment) => {
            const commentVoteScore = comment.commentVotes.reduce(
              (acc, vote) => {
                return acc + (vote.type === "UP" ? 1 : -1);
              },
              0
            );
            const commentVote = comment.commentVotes.find(
              (vote) => vote.userId === session?.user.id
            );

            return (
              <div key={comment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    comment={comment}
                    postId={postId}
                    currentVote={commentVote}
                    votesScore={commentVoteScore}
                  />
                </div>

                {comment.replies
                  .sort((a, b) => {
                    return b.commentVotes.length - a.commentVotes.length;
                  })
                  .map((reply) => {
                    const commentVoteScore = reply.commentVotes.reduce(
                      (acc, vote) => {
                        return acc + (vote.type === "UP" ? 1 : -1);
                      },
                      0
                    );
                    const commentVote = reply.commentVotes.find(
                      (vote) => vote.userId === session?.user.id
                    );

                    return (
                      <div
                        key={comment.id}
                        className="ml-2 py-2 pl-4 border-l-2 border-zinc-200"
                      >
                        <PostComment
                          comment={reply}
                          postId={postId}
                          currentVote={commentVote}
                          votesScore={commentVoteScore}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentSection;
