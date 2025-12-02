import { prisma } from "@/shared/lib/prisma";
import type { NoriSessionView } from "@/entities/nori-session/types";

export async function fetchSessionsForUser(userId: string): Promise<NoriSessionView[]> {
  const sessions = await prisma.noriSession.findMany({
    where: { participants: { some: { userId } } },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      createdBy: true,
    },
    orderBy: { date: "desc" },
  });

  return sessions.map((session) => {
    const totalInvest = session.participants.reduce((sum, p) => sum + p.invested, 0);
    const totalPayout = session.participants.reduce((sum, p) => sum + p.payout, 0);
    const net = totalPayout - totalInvest;
    const perHead = session.participants.length > 0 ? Math.round(net / session.participants.length) : 0;

    return {
      id: session.id,
      date: session.date.toISOString(),
      machineName: session.machineName,
      location: session.location,
      note: session.note,
      totalInvest,
      totalPayout,
      net,
      perHead,
      createdById: session.createdById,
      participants: session.participants.map((p) => ({
        userId: p.userId,
        name: p.user?.name ?? "匿名",
        email: p.user?.email ?? "",
        avatar: p.user?.image ?? undefined,
        invested: p.invested,
        payout: p.payout,
      })),
    } satisfies NoriSessionView;
  });
}
