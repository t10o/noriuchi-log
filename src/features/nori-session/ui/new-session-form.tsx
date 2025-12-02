"use client";

import { useMemo, useState, useTransition } from "react";

import type { FriendView } from "@/entities/friend/queries";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { cn } from "@/shared/lib/cn";
import { createNoriSessionAction } from "@/features/nori-session/actions";

const today = new Date().toISOString().slice(0, 10);

type ParticipantRow = {
  userId: string;
  name: string;
  email?: string | null;
  invested: number;
  payout: number;
};

type Props = {
  friends: FriendView[];
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
};

export function NewSessionForm({ friends, currentUser }: Props) {
  const [machineName, setMachineName] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today);
  const [participants, setParticipants] = useState<ParticipantRow[]>([
    {
      userId: currentUser.id,
      name: currentUser.name ?? "あなた",
      email: currentUser.email,
      invested: 0,
      payout: 0,
    },
  ]);
  const [friendToAdd, setFriendToAdd] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const totalInvest = participants.reduce((sum, p) => sum + (Number(p.invested) || 0), 0);
    const totalPayout = participants.reduce((sum, p) => sum + (Number(p.payout) || 0), 0);
    const net = totalPayout - totalInvest;
    const perHead = participants.length ? Math.round(net / participants.length) : 0;
    return { totalInvest, totalPayout, net, perHead };
  }, [participants]);

  const availableFriends = friends.filter(
    (f) => !participants.some((p) => p.userId === f.id),
  );

  const handleAddFriend = () => {
    if (!friendToAdd) return;
    const friend = friends.find((f) => f.id === friendToAdd);
    if (!friend) return;
    setParticipants((prev) => [
      ...prev,
      {
        userId: friend.id,
        name: friend.name ?? friend.email ?? "フレンド",
        email: friend.email,
        invested: 0,
        payout: 0,
      },
    ]);
    setFriendToAdd("");
  };

  const handleParticipantChange = (
    userId: string,
    field: "invested" | "payout",
    value: number,
  ) => {
    setParticipants((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, [field]: value } : p)),
    );
  };

  const handleRemove = (userId: string) => {
    if (userId === currentUser.id) return;
    setParticipants((prev) => prev.filter((p) => p.userId !== userId));
  };

  const handleSubmit = () => {
    setMessage("");
    startTransition(async () => {
      const payload = {
        date,
        machineName: machineName.trim(),
        location: location.trim() || undefined,
        note: note.trim() || undefined,
        participants: participants.map((p) => ({
          userId: p.userId,
          invested: Number(p.invested) || 0,
          payout: Number(p.payout) || 0,
        })),
      };

      const res = await createNoriSessionAction(payload);
      if (res.ok) {
        setMessage("ノリ打ち記録を保存しました。");
        setMachineName("");
        setLocation("");
        setNote("");
        setParticipants([
          {
            userId: currentUser.id,
            name: currentUser.name ?? "あなた",
            email: currentUser.email,
            invested: 0,
            payout: 0,
          },
        ]);
      } else {
        setMessage(res.message ?? "保存に失敗しました");
      }
    });
  };

  return (
    <Card className="bg-gradient-to-br from-white/10 via-white/5 to-white/0 text-white">
      <CardHeader className="flex flex-col gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">SESSION</p>
          <h2 className="text-2xl font-semibold">ノリ打ちを記録</h2>
        </div>
        {message && <p className="text-sm text-emerald-200">{message}</p>}
      </CardHeader>
      <CardBody className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-white/80">
            日付
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-white shadow-inner shadow-white/10 focus:border-fuchsia-300 focus:outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-white/80">
            機種名
            <input
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              placeholder="例: 新世紀エヴァンゲリオン～未来への咆哮～"
              className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-white shadow-inner shadow-white/10 focus:border-fuchsia-300 focus:outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-white/80">
            店舗/エリア (任意)
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="渋谷 / マルハン等"
              className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-white shadow-inner shadow-white/10 focus:border-fuchsia-300 focus:outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-white/80">
            メモ (任意)
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="立ち回りメモや出来事"
              className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-white shadow-inner shadow-white/10 focus:border-fuchsia-300 focus:outline-none"
            />
          </label>
        </div>

        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">PARTICIPANTS</p>
              <p className="text-lg font-semibold">投資・回収を入力</p>
            </div>
            {availableFriends.length > 0 && (
              <div className="ml-auto flex items-center gap-2 text-sm">
                <select
                  value={friendToAdd}
                  onChange={(e) => setFriendToAdd(e.target.value)}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-fuchsia-300 focus:outline-none"
                >
                  <option value="">フレンドを選択</option>
                  {availableFriends.map((f) => (
                    <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                      {f.name ?? f.email}
                    </option>
                  ))}
                </select>
                <Button variant="outline" onClick={handleAddFriend} disabled={!friendToAdd}>
                  追加
                </Button>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="grid grid-cols-1 divide-y divide-white/10">
              {participants.map((p) => (
                <div
                  key={p.userId}
                  className="grid grid-cols-1 gap-3 px-4 py-3 text-sm md:grid-cols-[2fr_repeat(2,minmax(0,1fr))_auto] md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-fuchsia-500/80 via-amber-400/80 to-indigo-500/80" />
                    <div>
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-xs text-white/60">{p.email ?? "メール未登録"}</p>
                    </div>
                  </div>
                  <label className="grid gap-1">
                    <span className="text-xs text-white/60">投資</span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={p.invested}
                      onChange={(e) => handleParticipantChange(p.userId, "invested", Number(e.target.value))}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-fuchsia-300 focus:outline-none"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs text-white/60">回収</span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={p.payout}
                      onChange={(e) => handleParticipantChange(p.userId, "payout", Number(e.target.value))}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-fuchsia-300 focus:outline-none"
                    />
                  </label>
                  <div className="flex justify-end">
                    {p.userId !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => handleRemove(p.userId)}
                        className="text-xs text-white/60 hover:text-white"
                        aria-label={`${p.name}を参加者から外す`}
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1">総投資: {totals.totalInvest.toLocaleString()} 円</span>
            <span className="rounded-full bg-white/10 px-3 py-1">総回収: {totals.totalPayout.toLocaleString()} 円</span>
            <span className="rounded-full bg-white/10 px-3 py-1">純益: {totals.net.toLocaleString()} 円</span>
            <span className="rounded-full bg-white/10 px-3 py-1">1人あたり分配: {totals.perHead.toLocaleString()} 円</span>
          </div>
          <p className="text-xs text-white/60">分配額は (総回収 - 総投資) ÷ 参加人数 で算出しています。</p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/80">入力後に「保存する」を押すとダッシュボードが更新されます。</p>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !machineName}
            className={cn("min-w-[180px] justify-center", isPending && "opacity-70")}
          >
            {isPending ? "保存中..." : "保存する"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
