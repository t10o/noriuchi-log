"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/shared/lib/prisma";

const participantSchema = z.object({
  userId: z.string().cuid(),
  invested: z.number().int().nonnegative(),
  payout: z.number().int().nonnegative(),
});

const createSessionSchema = z.object({
  date: z.string(),
  machineName: z.string().min(1, "機種名は必須です"),
  location: z.string().optional(),
  note: z.string().max(500).optional(),
  participants: z.array(participantSchema).min(1, "最低1人は必要です"),
});

export async function createNoriSessionAction(rawInput: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const parsed = createSessionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  const { date, machineName, location, note } = parsed.data;
  const participants = parsed.data.participants;

  const unique = new Map(participants.map((p) => [p.userId, p]));
  const normalizedParticipants = Array.from(unique.values());

  const includesSelf = normalizedParticipants.some((p) => p.userId === session.user!.id);
  if (!includesSelf) {
    return { ok: false, message: "自分自身を参加者に含めてください" };
  }

  const sessionDate = new Date(date);
  if (Number.isNaN(sessionDate.getTime())) {
    return { ok: false, message: "日付の形式が不正です" };
  }

  await prisma.noriSession.create({
    data: {
      date: sessionDate,
      machineName,
      location,
      note,
      createdById: session.user.id,
      participants: {
        create: normalizedParticipants.map((p) => ({
          userId: p.userId,
          invested: p.invested,
          payout: p.payout,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}
