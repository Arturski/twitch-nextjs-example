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
  cookies().delete("next-auth.session-token");
  redirect("/login");
}

export default async function Home() {
  const session: any = await getServerSession(authOptions);
  const channels = [];

  if (!!session) {
    try {
      const accessToken = session.token.access_token;
      const userId = session.token.providerAccountId;

      const follows = await getFollows(userId, accessToken);
      const followsIds = follows.map((f: any) => f.to_id).join("&id=");

      const { data: followsDetails } = await getFollowsDetails(
        followsIds,
        accessToken
      );

      followsDetails.sort((a: any, b: any) => {
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

      for (const followDetail of followsDetails) {
        const follow = followsStream.find(
          (f: any) => f.user_id === followDetail.id
        );
        follow
          ? channels.push({ ...follow, ...followDetail, liveId: follow.id })
          : channels.push(followDetail);
      }
    } catch (error) {
      return <SignOutAction deleteTokens={deleteTokens} />;
    }

    return (
      <>
        <Topbar image={session.token.picture} username={session.user.name} />
        <main>
          {channels.map((f: any) => (
            <ChannelCard
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
    redirect("/login");
  }
}
