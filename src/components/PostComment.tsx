"use client";

import { useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import { ExtendedComment } from "@/types/db";
import { formatTimeToNow } from "@/lib/timeFormat";
import CommentVotes from "./CommentVotes";
import { CommentVote } from "@prisma/client";
import { Button } from "./ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

interface PostCommentProps {
  comment: ExtendedComment;
  votesScore: number;
  currentVote: CommentVote | undefined;
  postId: string;
}

const PostComment = ({
  comment,
  votesScore,
  currentVote,
  postId,
}: PostCommentProps) => {
  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [isReplying, setIsReplying] = useState(false);
  const [input, setInput] = useState("");

  const { mutate: postComment, isLoading } = useMutation({
    mutationFn: async ({ content, postId, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        content,
        replyToId,
      };

      const { data } = await axios.patch(
        "/api/subreddit/post/comment",
        payload
      );
      return data;
    },
    onError: (err) => {
      return toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setIsReplying(false);
    },
  });

  return (
    <div className="flex flex-col" ref={commentRef}>
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            {comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 mt-2">{comment.content}</p>

      <div className="flex gap-2 items-center flex-wrap">
        <CommentVotes
          commentId={comment.id}
          initialVotesScore={votesScore}
          initialVote={currentVote?.type}
        />

        <Button
          onClick={() => {
            if (!session) {
              return router.push("/sign-in");
            }

            setIsReplying(true);
          }}
          variant="ghost"
          size="sm"
        >
          <MessageSquare className="w-4 h-4 mr-1.5" />
          Reply
        </Button>

        {isReplying ? (
          <div className="grid w-full gap-1.5">
            <Label>Your comment</Label>
            <div className="mt-2">
              <Textarea
                id="comment"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="What are your thoughts?"
              />

              <div className="mt-2 flex justify-end gap-2">
                <Button
                  tabIndex={-1}
                  variant={"ghost"}
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button
                  isLoading={isLoading}
                  disabled={input.length === 0}
                  onClick={() => {
                    if (!input) {
                      return;
                    }

                    postComment({
                      postId,
                      content: input,
                      replyToId: comment.replyToId ?? comment.id,
                    });
                  }}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostComment;
