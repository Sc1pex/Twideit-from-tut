import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const session = await getAuthSession();

  let followedSubredditsIds: string[] = [];
  if (session?.user) {
    const followedSubreddits = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        subredditId: true,
      },
    });

    followedSubredditsIds = followedSubreddits.map(
      ({ subredditId }) => subredditId
    );
  }

  try {
    const { limit, page, subredditName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subredditName: z.string().optional().nullable(),
      })
      .parse({
        subredditName: url.searchParams.get("subredditName"),
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
      });
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);

    let whereClause = {};
    if (subredditName) {
      whereClause = {
        subreddit: {
          name: subredditName,
        },
      };
    } else if (session) {
      whereClause = {
        subreddit: {
          id: {
            in: followedSubredditsIds,
          },
        },
      };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      take: limitNum,
      skip: limitNum * (pageNum - 1),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subreddit: true,
        postVotes: true,
        author: true,
        comments: true,
      },
    });

    return new Response(JSON.stringify(posts));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 422 });
    }

    console.log(err);
    return new Response("Could not get posts", { status: 500 });
  }
}
