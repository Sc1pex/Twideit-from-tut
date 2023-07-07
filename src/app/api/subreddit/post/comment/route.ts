import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { z } from "zod";

export async function PATCH(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { postId, content, replyToId } = CommentValidator.parse(body);

    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await prisma.comment.create({
      data: {
        postId,
        authorId: session.user.id,
        content,
        replyToId,
      },
    });

    return new Response("Ok");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 422 });
    }

    return new Response("Could not register your vote", { status: 500 });
  }
}
