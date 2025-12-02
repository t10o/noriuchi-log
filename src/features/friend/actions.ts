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
    // 逆方向の申請が来ている場合はそれを承認する
    if (existing.friendId === session.user.id) {
      await prisma.friendship.update({
        where: { id: existing.id },
        data: { status: FriendshipStatus.ACCEPTED },
      });
      revalidatePath("/dashboard");
      return { ok: true, message: "申請を承認しました" };
    }
    // 自分がすでに申請済み
    return { ok: true, message: "申請中です。相手の承認をお待ちください" };
  }

  await prisma.friendship.create({
    data: {
      userId: session.user.id,
      friendId: target.id,
      status: FriendshipStatus.PENDING,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true, message: "フレンド申請を送りました" };
}

const respondSchema = z.object({
  requestId: z.string().cuid(),
  accept: z.boolean(),
});

export async function respondFriendRequestAction(rawInput: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const parsed = respondSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, message: "リクエストが不正です" };
  }

  const { requestId, accept } = parsed.data;

  const request = await prisma.friendship.findUnique({ where: { id: requestId } });
  if (!request || request.friendId !== session.user.id) {
    return { ok: false, message: "対象の申請が見つかりません" };
  }

  if (request.status !== FriendshipStatus.PENDING) {
    return { ok: true, message: "既に処理済みです" };
  }

  if (accept) {
    await prisma.friendship.update({ where: { id: requestId }, data: { status: FriendshipStatus.ACCEPTED } });
    revalidatePath("/dashboard");
    return { ok: true, message: "フレンドを承認しました" };
  }

  await prisma.friendship.delete({ where: { id: requestId } });
  revalidatePath("/dashboard");
  return { ok: true, message: "申請を拒否しました" };
}
