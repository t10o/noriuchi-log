"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/shared/lib/prisma";
import { FriendshipStatus } from "@prisma/client";

const addFriendSchema = z.object({
  email: z.string().email("メールアドレスの形式が不正です"),
});

export async function addFriendAction(rawInput: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const parsed = addFriendSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "入力を確認してください" };
  }

  const email = parsed.data.email.toLowerCase();

  const target = await prisma.user.findUnique({ where: { email } });
  if (!target) {
    return { ok: false, message: "該当するユーザーが見つかりません" };
  }
  if (target.id === session.user.id) {
    return { ok: false, message: "自分自身はフレンド登録できません" };
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: session.user.id, friendId: target.id },
        { userId: target.id, friendId: session.user.id },
      ],
    },
  });

  if (existing) {
    if (existing.status === FriendshipStatus.ACCEPTED) {
      return { ok: true, message: "既にフレンドです" };
    }
    await prisma.friendship.update({
      where: { id: existing.id },
      data: { status: FriendshipStatus.ACCEPTED },
    });
    revalidatePath("/dashboard");
    return { ok: true, message: "フレンド承認済みに更新しました" };
  }

  await prisma.friendship.create({
    data: {
      userId: session.user.id,
      friendId: target.id,
      status: FriendshipStatus.ACCEPTED,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true, message: "フレンドを追加しました" };
}
