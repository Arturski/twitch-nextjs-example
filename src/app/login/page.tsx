"use client";

import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { BsTwitch } from "react-icons/bs";

const Login = () => {
  const { data: session } = useSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col items-center gap-5a">
        <BsTwitch className="h-12 w-12" />
        <button
          className="bg-violet-700 p-3 text-gray-50"
          onClick={() => signIn()}
        >
          Sign in!
        </button>
      </div>
    </div>
  );
};

export default Login;
