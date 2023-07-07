import { CACHE_AFTER_VOTESCORE } from "@/constants";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import { CommentVoteValidator, PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";
import { z } from "zod";

export async function PATCH(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const existingVote = await prisma.commentVote.findFirst({
      where: {
        commentId,
        userId: session.user.id,
      },
    });

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        author: true,
        commentVotes: true,
      },
    });
    if (!comment) {
      return new Response("Comment not found", { status: 404 });
    }

    if (!existingVote) {
      await prisma.commentVote.create({
        data: {
          commentId,
          userId: session.user.id,
          type: voteType,
        },
      });
    } else {
      if (existingVote.type === voteType) {
        await prisma.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: existingVote.userId,
            },
          },
        });
      } else {
        await prisma.commentVote.update({
          where: {
            userId_commentId: {
              commentId,
              userId: existingVote.userId,
            },
          },
          data: {
            type: voteType,
          },
        });
      }
    }
    return new Response("Ok");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 422 });
    }

    console.log(err);
    return new Response("Could not register your vote", { status: 500 });
  }
}
