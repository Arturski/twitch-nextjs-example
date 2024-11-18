import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import {
  getFollows,
  getFollowsDetails,
  getFollowsStream,
} from "@/api/twitch-api";
import Topbar from "@/components/topbar.component";
import ChannelCard from "@/components/channel-card.component";
import { cookies } from "next/headers";
import SignOutAction from "@/components/sign-out-action.component";

async function deleteTokens() {
  "use server";
  console.log("[DEBUG] Deleting tokens and clearing session.");
  cookies().delete("next-auth.session-token");
}

export default async function Home() {
  console.log("[DEBUG] Home page rendering started.");

  // Retrieve the session
  const session: any = await getServerSession(authOptions);
  console.log("[DEBUG] Retrieved session:", JSON.stringify(session, null, 2));

  // Gracefully handle missing session
  if (!session) {
    console.log("[DEBUG] No session found. Displaying login message.");
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-700">
            You are not logged in.
          </h1>
          <p className="text-gray-600">
            Please{" "}
            <a href="/login" className="text-violet-700 underline">
              log in
            </a>{" "}
            to access your channels.
          </p>
        </div>
      </div>
    );
  }

  console.log("[DEBUG] Session is valid. Proceeding with data fetching.");

  // Initialize channels array
  const channels = [];

  try {
    const accessToken = session.token?.accessToken;
    const userId = session.token?.providerAccountId;

    if (!accessToken || !userId) {
      console.error("[ERROR] Missing access token or user ID in session.");
      return <SignOutAction deleteTokens={deleteTokens} />;
    }

    console.log("[DEBUG] Access Token:", accessToken);
    console.log("[DEBUG] User ID:", userId);

    // Fetch follows data
    const follows = await getFollows(userId, accessToken);
    console.log("[DEBUG] Retrieved follows data:", follows);

    const followsIds = follows.map((f: any) => f.to_id).join("&id=");
    console.log("[DEBUG] Follows IDs:", followsIds);

    // Fetch follows details
    const { data: followsDetails } = await getFollowsDetails(followsIds, accessToken);
    console.log("[DEBUG] Retrieved follows details:", followsDetails);

    followsDetails.sort((a: any, b: any) => {
      console.log(`[DEBUG] Sorting follows details: ${a.display_name} vs ${b.display_name}`);
      return a.display_name.localeCompare(b.display_name);
    });

    // Fetch stream data
    const followsStream = await getFollowsStream(userId, accessToken);
    console.log("[DEBUG] Retrieved follows stream data:", followsStream);

    // Combine follows details with stream data
    for (const followDetail of followsDetails) {
      const follow = followsStream.find((f: any) => f.user_id === followDetail.id);
      if (follow) {
        console.log("[DEBUG] Follow is live:", followDetail);
        channels.push({ ...follow, ...followDetail, liveId: follow.id });
      } else {
        console.log("[DEBUG] Follow is not live:", followDetail);
        channels.push(followDetail);
      }
    }

    console.log("[DEBUG] Final channels data:", channels);
  } catch (error) {
    console.error("[ERROR] Error occurred while fetching Twitch data:", error);
    return <SignOutAction deleteTokens={deleteTokens} />;
  }

  console.log("[DEBUG] Rendering main content with channels.");

  return (
    <>
      <Topbar image={session.token?.picture} username={session.user?.name} />
      <main>
        {channels.map((channel: any) => (
          <ChannelCard
            key={channel.display_name}
            isLive={!!channel.liveId}
            name={channel.display_name}
            description={channel.description}
            profile={channel.profile_image_url}
            liveTitle={channel.title}
            livePreview={channel.thumbnail_url}
          />
        ))}
      </main>
    </>
  );
}
