import Link from "next/link";
import { Icons } from "./Icons";
import UserAuthForm from "./UserAuthForm";

const SignIn = () => {
  return (
    <div className="container w-full flex flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-6 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      </div>

      <UserAuthForm className="" />

      <p className="text-center text-sm text-zinc-700">
        New to Twideit?{" "}
        <Link href="/sign-up" className="hover:text-zinc-900">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default SignIn;
