"use client";

import { signIn, signOut } from "next-auth/react";
import { BsTwitch } from "react-icons/bs";

const Topbar = ({ image, username }: any) => {
  return (
    <menu className="w-full h-14 bg-violet-700 p-3 text-gray-50 flex items-center justify-between">
      {username && (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full bg-center bg-contain"
            style={{
              backgroundImage: image ? `url(${image})` : ``,
            }}
          ></div>
          <p>{username}</p>
        </div>
      )}
      {!username && <button onClick={() => signIn()}>Login</button>}
      <div className="flex items-center gap-3">
        {username && <button onClick={() => signOut()}>Logout</button>}
        <BsTwitch className="h-6 w-6" />
      </div>
    </menu>
  );
};

export default Topbar;
