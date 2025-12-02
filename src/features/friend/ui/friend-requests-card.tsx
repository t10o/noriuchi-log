"use client";

import { format } from "date-fns";
import { useTransition } from "react";

import type { FriendRequestView } from "@/entities/friend/queries";
import { respondFriendRequestAction } from "@/features/friend/actions";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";

type Props = {
  requests: FriendRequestView[];
};

export function FriendRequestsCard({ requests }: Props) {
  const [isPending, startTransition] = useTransition();

  const handle = (requestId: string, accept: boolean) => {
    startTransition(async () => {
      await respondFriendRequestAction({ requestId, accept });
    });
  };

  return (
    <Card className="bg-white/5 text-white">
      <CardHeader className="flex items-center gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">FRIEND REQUESTS</p>
          <h3 className="text-xl font-semibold">承認待ち</h3>
        </div>
        {requests.length === 0 && <span className="ml-auto text-sm text-white/50">なし</span>}
      </CardHeader>
      <CardBody className="space-y-3">
        {requests.map((r) => (
          <div
            key={r.requestId}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold">{r.name ?? r.email ?? "匿名"}</p>
              <p className="text-xs text-white/60">{r.email}</p>
              <p className="text-[11px] text-white/50">{format(r.createdAt, "yyyy/MM/dd HH:mm")}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="secondary"
                className="px-3 py-1 text-sm"
                disabled={isPending}
                onClick={() => handle(r.requestId, true)}
              >
                承認
              </Button>
              <Button
                variant="ghost"
                className="px-3 py-1 text-sm"
                disabled={isPending}
                onClick={() => handle(r.requestId, false)}
              >
                拒否
              </Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
