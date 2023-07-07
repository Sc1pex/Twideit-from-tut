import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { subredditId } = SubredditSubscriptionValidator.parse(body);

    const subsciptionExists = await prisma.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });
    if (!subsciptionExists) {
      return new Response("Not subscribed", { status: 400 });
    }

    const subreddit = await prisma.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: session.user.id,
      },
    });
    if (subreddit) {
      return new Response("Cannot unsubscribe from own subreddit", {
        status: 400,
      });
    }

    await prisma.subscription.delete({
      where: {
        userId_subredditId: {
          subredditId,
          userId: session.user.id,
        },
      },
    });

    return new Response(subredditId);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 422 });
    }

    console.log(err);
    return new Response("Could not subscribe to subreddit", { status: 500 });
  }
}
