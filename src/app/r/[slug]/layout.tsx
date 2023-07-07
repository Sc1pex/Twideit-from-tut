import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle";
import ToFeedButton from "@/components/ToFeedButton";
import { INFINITE_SCROLL_GET_COUNT } from "@/constants";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format, sub } from "date-fns";
import { notFound } from "next/navigation";

const Layout = async ({
  children,
  params: { slug },
}: {
  children: React.ReactNode;
  params: { slug: string };
}) => {
  const session = await getAuthSession();

  const subreddit = await prisma.subreddit.findUnique({
    where: {
      name: slug,
    },
    include: {
      posts: {
        include: {
          author: true,
          postVotes: true,
        },
      },
    },
  });

  const subscription = !session?.user
    ? undefined
    : await prisma.subscription.findFirst({
        where: {
          Subreddit: {
            name: slug,
          },
          user: {
            id: session.user.id,
          },
        },
      });
  const isSubscribed = !!subscription;

  if (!subreddit) {
    return notFound();
  }

  const memberCount = await prisma.subscription.count({
    where: {
      Subreddit: {
        name: slug,
      },
    },
  });

  return (
    <div className="container max-w-7xl h-full pt-12">
      <div>
        <ToFeedButton />

        <div className="grid grid-cols-3 gap-y-4 gap-x-4 px-6">
          <div className="flex flex-col col-span-2 space-y-6">{children}</div>

          <div className="overflow-hidden h-fit rounded-lg border border-gray-200 order-last">
            <div className="px-6 py-4">
              <p className="font-semibold py-3">About r/{subreddit.name}</p>
            </div>

            <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-700">
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {format(subreddit.createdAt, "MMMM d, yyyy")}
                  </time>
                </dd>
              </div>

              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Members</dt>
                <dd className="text-gray-700">
                  <div className="text-gray-900">{memberCount}</div>
                </dd>
              </div>

              {subreddit.creatorId === session?.user?.id ? (
                <div className="flex justify-between gap-x-4 py-3">
                  <p className="text-gray-500">You created this community</p>
                </div>
              ) : null}

              {subreddit.creatorId !== session?.user?.id ? (
                <SubscribeLeaveToggle
                  subredditId={subreddit.id}
                  subredditName={subreddit.name}
                  isSubscribed={isSubscribed}
                />
              ) : null}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
