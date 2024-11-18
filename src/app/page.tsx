import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import {
  getFollows,
  getFollowsDetails,
  getFollowsStream,
} from "@/api/twitch-api";
import Topbar from "@/components/topbar.component";
import ChannelCard from "@/components/channel-card.component";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SignOutAction from "@/components/sign-out-action.component";

async function deleteTokens() {
  "use server";
  console.log("[DEBUG] Deleting tokens and redirecting to login.");
  cookies().delete("next-auth.session-token");
  redirect("/login");
}

export default async function Home() {
  console.log("[DEBUG] Home page rendering started.");

  const session: any = await getServerSession(authOptions);
  console.log("[DEBUG] Retrieved session:", session);

  const channels = [];

  if (!!session) {
    try {
      console.log("[DEBUG] Session is valid. Proceeding with data fetching.");
      const accessToken = session.token.access_token;
      const userId = session.token.providerAccountId;

      console.log("[DEBUG] Access Token:", accessToken);
      console.log("[DEBUG] User ID:", userId);

      const follows = await getFollows(userId, accessToken);
      console.log("[DEBUG] Retrieved follows data:", follows);

      const followsIds = follows.map((f: any) => f.to_id).join("&id=");
      console.log("[DEBUG] Follows IDs:", followsIds);

      const { data: followsDetails } = await getFollowsDetails(
        followsIds,
        accessToken
      );
      console.log("[DEBUG] Retrieved follows details:", followsDetails);

      followsDetails.sort((a: any, b: any) => {
        console.log(`[DEBUG] Sorting follows details: ${a.display_name} vs ${b.display_name}`);
        let x = a.display_name.toLowerCase();
        let y = b.display_name.toLowerCase();

        if (x > y) {
          return 1;
        }
        if (x < y) {
          return -1;
        }
        return 0;
      });

      const followsStream = await getFollowsStream(userId, accessToken);
      console.log("[DEBUG] Retrieved follows stream data:", followsStream);

      for (const followDetail of followsDetails) {
        const follow = followsStream.find(
          (f: any) => f.user_id === followDetail.id
        );
        if (follow) {
          console.log("[DEBUG] Follow found for detail:", followDetail);
          channels.push({ ...follow, ...followDetail, liveId: follow.id });
        } else {
          console.log("[DEBUG] Follow not live:", followDetail);
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
        <Topbar image={session.token.picture} username={session.user.name} />
        <main>
          {channels.map((f: any) => (
            <ChannelCard
              key={f.display_name}
              isLive={f.liveId}
              name={f.display_name}
              description={f.description}
              profile={f.profile_image_url}
              liveTitle={f.title}
              livePreview={f.thumbnail_url}
            />
          ))}
        </main>
      </>
    );
  } else {
    console.log("[DEBUG] No session found. Redirecting to login.");
    redirect("/login");
  }
}
