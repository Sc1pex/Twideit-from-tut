import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export async function PATCH(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { name } = UsernameValidator.parse(body);

    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const username = await prisma.user.findUnique({
      where: { username: name },
    });
    if (username) {
      return new Response("Username already taken", { status: 409 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { username: name },
    });

    return new Response("Ok");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 422 });
    }

    return new Response("Could not change username", { status: 500 });
  }
}
