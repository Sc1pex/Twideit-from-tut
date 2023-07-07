import CustomFeed from "@/components/CustomFeed";
import GeneralFeed from "@/components/GeneralFeed";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await getAuthSession();

  return (
    <>
      <h1 className="font-bold text-4xl">Your feed</h1>
      <div className="grid grid-cols-3 gap-y-4 gap-x-4 py-6">
        {session ? <CustomFeed /> : <GeneralFeed />}

        <div className="overflow-hidden h-fit rounded-lg border border-x-gray-200 order-last">
          <div className="bg-emerald-100 px-6 py-4">
            <p className="font-semibold py-3 flex items-center gap-1.5">
              <HomeIcon className="w-4 h-4" />
              Home
            </p>
          </div>

          <div className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
            <div className="flex justify-between gap-y-4 py-3">
              <p className="text-zinc-500">
                Your personal feed. See what’s happening in your communities.
              </p>
            </div>

            <Link
              className={buttonVariants({
                className: "w-full mt-4 mb-6",
              })}
              href="/r/create"
            >
              Create community
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}