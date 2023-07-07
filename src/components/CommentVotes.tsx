"use client";

import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CommentVoteRequest } from "@/lib/validators/vote";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/Button";

interface CommentVoteProps {
  initialVote?: VoteType | null;
  initialVotesScore: number;
  commentId: string;
}

const CommentVotes = ({
  initialVotesScore,
  commentId,
  initialVote,
}: CommentVoteProps) => {
  const { loginToast } = useCustomToasts();
  const [votesScore, setVotesScore] = useState(initialVotesScore);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType,
      };

      const { data } = await axios.patch(
        "/api/subreddit/post/comment/vote",
        payload
      );
    },
    onError: (err, voteType) => {
      if (voteType === "UP") {
        setVotesScore((prev) => prev - 1);
      } else {
        setVotesScore((prev) => prev + 1);
      }

      setCurrentVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          loginToast();
        }
      }

      return toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    },
    onMutate: (voteType) => {
      if (currentVote === voteType) {
        setCurrentVote(undefined);
        if (voteType === "UP") {
          setVotesScore((prev) => prev - 1);
        } else {
          setVotesScore((prev) => prev + 1);
        }
      } else {
        setCurrentVote(voteType);
        if (voteType === "UP") {
          setVotesScore((prev) => prev + (currentVote ? 2 : 1));
        } else {
          setVotesScore((prev) => prev - (currentVote ? 2 : 1));
        }
      }
    },
  });

  return (
    <div className="flex gap-1">
      <Button
        size={"sm"}
        variant={"ghost"}
        aria-label="upvote"
        onClick={() => vote("UP")}
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-500 ", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesScore}
      </p>

      <Button
        size={"sm"}
        variant={"ghost"}
        aria-label="downvote"
        onClick={() => vote("DOWN")}
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-500 ", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentVotes;
