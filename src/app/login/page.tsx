"use client";

import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { BsTwitch } from "react-icons/bs";

const Login = () => {
  console.log("[DEBUG] Rendering Login Component...");

  const { data: session, status } = useSession();

  console.log("[DEBUG] Session Status:", status);
  console.log("[DEBUG] Session Data:", session);

  // Redirect if the user is already logged in
  if (status === "authenticated") {
    console.log("[DEBUG] User is authenticated. Redirecting to home page...");
    redirect("/");
  }

  // If session is still loading, you can display a loader or placeholder (optional)
  if (status === "loading") {
    console.log("[DEBUG] Session is still loading. Displaying loader...");
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col items-center gap-5">
        <BsTwitch className="h-12 w-12" />
        <button
          className="bg-violet-700 p-3 text-gray-50"
          onClick={() => {
            console.log("[DEBUG] Log in button clicked. Initiating signIn process...");
            signIn("twitch"); // Ensure "twitch" is used if your NextAuth provider is named "twitch"
          }}
        >
          Log in with twitch!
        </button>
      </div>
    </div>
  );
};

export default Login;
