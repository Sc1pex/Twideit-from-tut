import { prisma } from "@/lib/db";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const query = url.searchParams.get("q");

  if (!query) {
    return new Response("Bad Request", { status: 400 });
  }

  const results = await prisma.subreddit.findMany({
    where: {
      name: {
        startsWith: query,
      },
    },
    include: {
      _count: true,
    },
    take: 5,
  });

  return new Response(JSON.stringify(results));
}
