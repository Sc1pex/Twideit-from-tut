import { CACHE_AFTER_VOTESCORE } from "@/constants";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { postId, voteType } = PostVoteValidator.parse(body);

    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const existingVote = await prisma.postVote.findFirst({
      where: {
        postId,
        userId: session.user.id,
      },
    });

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        postVotes: true,
      },
    });
    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    if (!existingVote) {
      await prisma.postVote.create({
        data: {
          postId,
          userId: session.user.id,
          type: voteType,
        },
      });
    } else {
      if (existingVote.type === voteType) {
        await prisma.postVote.delete({
          where: {
            userId_postId: {
              postId,
              userId: existingVote.userId,
            },
          },
        });

        const votesScore = post.postVotes.reduce((acc, vote) => {
          return acc + (vote.type === "UP" ? 1 : -1);
        }, 0);
        if (votesScore >= CACHE_AFTER_VOTESCORE) {
          const cachePayload: CachedPost = {
            id: post.id,
            title: post.title,
            authorUsername: post.author.username ?? "",
            content: JSON.stringify(post.content),
            currentVote: voteType,
            createdAt: post.createdAt,
          };

          await redis.hset(`post:${post.id}`, cachePayload);
        }
      } else {
        await prisma.postVote.update({
          where: {
            userId_postId: {
              postId,
              userId: existingVote.userId,
            },
          },
          data: {
            type: voteType,
          },
        });

        const votesScore = post.postVotes.reduce((acc, vote) => {
          return acc + (vote.type === "UP" ? 1 : -1);
        }, 0);
        if (votesScore >= CACHE_AFTER_VOTESCORE) {
          const cachePayload: CachedPost = {
            id: post.id,
            title: post.title,
            authorUsername: post.author.username ?? "",
            content: JSON.stringify(post.content),
            currentVote: voteType,
            createdAt: post.createdAt,
          };

          await redis.hset(`post:${post.id}`, cachePayload);
        }
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
