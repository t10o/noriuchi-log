import { FriendshipStatus } from "@prisma/client";

import { prisma } from "@/shared/lib/prisma";

export type FriendView = {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
};

export async function fetchFriends(userId: string): Promise<FriendView[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [{ userId }, { friendId: userId }],
    },
    include: {
      user: true,
      friend: true,
    },
  });

  const mapped = friendships.map((f) => {
    const other = f.userId === userId ? f.friend : f.user;
    return {
      id: other.id,
      name: other.name,
      email: other.email,
      image: other.image,
    } satisfies FriendView;
  });

  const uniqueById = new Map(mapped.map((f) => [f.id, f]));
  return Array.from(uniqueById.values());
}
