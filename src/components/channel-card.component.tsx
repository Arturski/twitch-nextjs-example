"use client";

import { signIn, signOut } from "next-auth/react";
import { BsTwitch } from "react-icons/bs";

const ChannelCard = ({
  isLive,
  name,
  description,
  profile,
  liveTitle,
  livePreview,
}: any) => {
  return (
    <div className="py-10 px-5 shadow-lg my-5">
      <div className="flex items-between gap-4">
        <div
          className="w-12 h-12 rounded-lg bg-center bg-contain"
          style={{
            backgroundImage: profile ? `url(${profile})` : ``,
          }}
        ></div>
        <div className="flex-1">
          <p className="font-semibold">{name}</p>
          <p className="text-sm">{description}</p>
        </div>
        <div>
          <div
            className={`rounded-lg p-1 text-xs ${
              isLive
                ? "bg-green-200 text-green-600"
                : "bg-gray-200 text-gray-600"
            } flex-grow-0 flex-shrink-0`}
          >
            {isLive ? "ONLINE" : "OFFLINE"}
          </div>
        </div>
      </div>
      {isLive && (
        <div className="flex flex-col items-center mt-10">
          <div
            className="w-80 h-52 rounded-lg bg-center bg-contain"
            style={{
              backgroundImage: livePreview
                ? `url(${livePreview
                    .replace("{width}", "320")
                    .replace("{height}", "208")})`
                : ``,
            }}
          ></div>
          <p className="text-sm mt-5 px-5 text-center">{liveTitle}</p>
        </div>
      )}
    </div>
  );
};

export default ChannelCard;
