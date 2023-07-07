"use client";

import { cn } from "@/lib/utils";
import { FC, useState } from "react";
import { Button } from "./ui/Button";
import { signIn } from "next-auth/react";
import { Icons } from "./Icons";
import { useToast } from "@/hooks/use-toast";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const UserAuthForm: FC<UserAuthFormProps> = ({ className, ...props }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginWithDiscord = async () => {
    setIsLoading(true);

    try {
      await signIn("discord");
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: "There was an error logging in with Discord.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      await signIn("google");
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: "There was an error logging in with Discord.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn("flex justify-center flex-col gap-4", className)}
      {...props}
    >
      <Button size={"sm"} className="w-full" onClick={loginWithDiscord}>
        <Icons.discrod className="w-4 h-4 mr-4" />
        Discord
      </Button>
      <Button size={"sm"} className="w-full" onClick={loginWithGoogle}>
        <Icons.google className="w-4 h-4 mr-4" />
        Google
      </Button>
    </div>
  );
};

export default UserAuthForm;
