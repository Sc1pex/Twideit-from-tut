import { Comment, Post, PostVote, Subreddit, User } from "@prisma/client";

export type ExtendedPost = Post & {
  subreddit: Subreddit;
  postVotes: PostVote[];
  author: User;
  comments: Comment[];
};

export type ExtendedComment = Comment & {
  commentVotes: CommentVote[];
  author: User;
};
