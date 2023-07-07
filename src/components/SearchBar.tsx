"use client";

import { useOnClickOutside } from "@/hooks/use-click-outside";
import { Prisma, Subreddit } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CommandEmpty, CommandGroup } from "cmdk";
import debounce from "lodash.debounce";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Command, CommandInput, CommandItem, CommandList } from "./ui/Command";

const SearchBar = () => {
  const [input, setInput] = useState("");
  const router = useRouter();

  const {
    data: queryResult,
    refetch,
    isFetched,
    isLoading,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];

      const { data } = await axios.get(`/api/search?q=${input}`);
      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false,
  });

  const request = debounce(() => {
    refetch();
  }, 300);

  const debounceReq = useCallback(() => {
    request();
  }, []);

  const commandRef = useRef(null);
  useOnClickOutside(commandRef, () => {
    setInput("");
  });

  return (
    <Command
      ref={commandRef}
      className="relative rounded-lg border max-w-lg z-50 overflow-visible"
    >
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debounceReq();
        }}
        className="outline-nonne border-none ring-0"
        placeholder="Search communities..."
      />

      {input.length > 0 ? (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(queryResult?.length ?? 0) > 0 ? (
            <CommandGroup heading="Communities">
              {queryResult?.map((subreddit) => (
                <CommandItem
                  onSelect={(e) => {
                    router.push(`/r/${subreddit.name}`);
                    router.refresh();
                  }}
                  key={subreddit.id}
                  value={subreddit.name}
                >
                  <Users className="mr-2 w-4 h-4" />
                  <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      ) : null}
    </Command>
  );
};

export default SearchBar;
