const TWITCH_URL_API = "https://api.twitch.tv/helix";

export const getFollows = async (
  userId: number,
  accessToken: string,
  after: string = "",
  follows: any = []
): Promise<any> => {
    const response = await fetch(
      `${TWITCH_URL_API}/users/follows?from_id=${userId}${
        after ? `&after=${after}` : ""
      }`,
      {
        headers: {
          "Client-Id": process.env.NEXT_PUBLIC_CLIENT_ID!,
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    const data = await response.json();

    if(!!data.error && data.status === 401) {
      throw new Error('TOKEN NOT VALID')
    }
      
    follows = [...follows, ...data.data];
    if (data.pagination && data.pagination.cursor) {
      return await getFollows(
        userId,
        accessToken,
        data.pagination.cursor,
        follows
      );
    }
  
    return follows;
  
};

export const getFollowsDetails = async (ids: any, accessToken: string) => {
  const response = await fetch(`${TWITCH_URL_API}/users?${ids}`, {
    headers: {
      "Client-Id": process.env.NEXT_PUBLIC_CLIENT_ID!,
      Authorization: "Bearer " + accessToken,
    },
  });
  const data = await response.json();

  return data;
};

export const getFollowsStream = async (
  userId: number,
  accessToken: string,
  after: string = "",
  follows: any = []
): Promise<any> => {
  const response = await fetch(
    `${TWITCH_URL_API}/streams/followed?user_id=${userId}${
      after ? `&after=${after}` : ""
    }`,
    {
      headers: {
        "Client-Id": process.env.NEXT_PUBLIC_CLIENT_ID!,
        Authorization: "Bearer " + accessToken,
      },
    }
  );
  const data = await response.json();

  follows = [...follows, ...data.data];
  if (data.pagination && data.pagination.cursor) {
    return await getFollowsStream(
      userId,
      accessToken,
      data.pagination.cursor,
      follows
    );
  }

  return follows;
};
