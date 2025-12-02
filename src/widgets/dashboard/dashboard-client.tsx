"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { useMemo, useState } from "react";

import type { FriendView } from "@/entities/friend/queries";
import type { NoriSessionView } from "@/entities/nori-session/types";
import { AddFriendCard } from "@/features/friend/ui/add-friend-card";
import { NewSessionForm } from "@/features/nori-session/ui/new-session-form";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";
import { cn } from "@/shared/lib/cn";

const currency = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" });

type Props = {
  sessions: NoriSessionView[];
  friends: FriendView[];
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

type ChartRow = { date: string; net: number; invest: number; payout: number };

export function DashboardClient({ sessions, friends, currentUser }: Props) {
  const [friendFilter, setFriendFilter] = useState<string>("");
  const [machineFilter, setMachineFilter] = useState<string>("");

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchFriend = friendFilter ? s.participants.some((p) => p.userId === friendFilter) : true;
      const matchMachine = machineFilter
        ? s.machineName.toLowerCase().includes(machineFilter.toLowerCase())
        : true;
      return matchFriend && matchMachine;
    });
  }, [friendFilter, machineFilter, sessions]);

  const machineOptions = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => set.add(s.machineName));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [sessions]);

  const summary = useMemo(() => {
    const invest = filteredSessions.reduce((sum, s) => sum + s.totalInvest, 0);
    const payout = filteredSessions.reduce((sum, s) => sum + s.totalPayout, 0);
    const net = payout - invest;
    const totalParticipants = filteredSessions.reduce((sum, s) => sum + s.participants.length, 0);
    const perHead = totalParticipants ? Math.round(net / totalParticipants) : 0;
    return { invest, payout, net, perHead };
  }, [filteredSessions]);

  const chartData: ChartRow[] = useMemo(() => {
    const map = new Map<string, ChartRow>();
    filteredSessions.forEach((s) => {
      const day = format(new Date(s.date), "yyyy-MM-dd");
      if (!map.has(day)) {
        map.set(day, { date: day, net: 0, invest: 0, payout: 0 });
      }
      const row = map.get(day)!;
      row.net += s.net;
      row.invest += s.totalInvest;
      row.payout += s.totalPayout;
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSessions]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 text-white">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">Dashboard</p>
          <h1 className="text-3xl font-semibold">ノリ打ちの軌跡</h1>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <label className="text-sm text-white/70" htmlFor="friend-filter">
            フレンド
          </label>
          <select
            id="friend-filter"
            value={friendFilter}
            onChange={(e) => setFriendFilter(e.target.value)}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-fuchsia-300 focus:outline-none"
          >
            <option value="">自分が絡む全て</option>
            {friends.map((f) => (
              <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                {f.name ?? f.email}
              </option>
            ))}
          </select>

          <label className="text-sm text-white/70" htmlFor="machine-filter">
            機種
          </label>
          <input
            id="machine-filter"
            list="machine-options"
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            placeholder="機種名を入力"
            className="w-48 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-fuchsia-300 focus:outline-none"
          />
          <datalist id="machine-options">
            {machineOptions.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="総投資" value={currency.format(summary.invest)} tone="slate" />
        <StatCard title="総回収" value={currency.format(summary.payout)} tone="emerald" />
        <StatCard title="累計損益" value={currency.format(summary.net)} tone={summary.net >= 0 ? "pink" : "amber"} />
        <StatCard title="1人あたり分配" value={currency.format(summary.perHead)} tone="indigo" subtitle="(総損益 ÷ 延べ参加人数)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-white/5 text-white">
          <CardHeader className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/70">TREND</p>
              <h3 className="text-xl font-semibold">日別の純益カーブ</h3>
            </div>
            <span className="ml-auto text-sm text-white/60">フィルタ適用後のデータ</span>
          </CardHeader>
          <CardBody className="h-[280px] pr-2">
            {chartData.length === 0 ? (
              <p className="text-sm text-white/60">まだデータがありません。ノリ打ちを登録するとグラフが描画されます。</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 10 }}>
                  <defs>
                    <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff8bf1" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ff8bf1" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" tickFormatter={(v) => format(new Date(v), "MM/dd")} />
                  <YAxis stroke="rgba(255,255,255,0.7)" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip
                    contentStyle={{ background: "rgba(12,12,20,0.9)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
                    formatter={(value: number) => currency.format(value)}
                    labelFormatter={(label) => format(new Date(label), "yyyy/MM/dd")}
                  />
                  <Area type="monotone" dataKey="net" stroke="#ff90e8" strokeWidth={2} fill="url(#net)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <AddFriendCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Timeline sessions={filteredSessions} />
        </div>
        <div className="lg:col-span-2">
          <NewSessionForm friends={friends} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}

type StatTone = "slate" | "emerald" | "pink" | "amber" | "indigo";

function StatCard({ title, value, subtitle, tone }: { title: string; value: string; subtitle?: string; tone: StatTone }) {
  const toneClass: Record<StatTone, string> = {
    slate: "from-slate-300/30 via-white/5 to-slate-900/40",
    emerald: "from-emerald-300/40 via-emerald-400/10 to-emerald-900/30",
    pink: "from-pink-300/50 via-fuchsia-400/15 to-slate-900/40",
    amber: "from-amber-300/40 via-amber-300/10 to-amber-900/30",
    indigo: "from-indigo-300/50 via-indigo-400/10 to-slate-900/40",
  };

  return (
    <Card className={cn("text-white", `bg-gradient-to-br ${toneClass[tone]}`)}>
      <CardBody className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-white/70">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
      </CardBody>
    </Card>
  );
}

function Timeline({ sessions }: { sessions: NoriSessionView[] }) {
  return (
    <Card className="bg-white/5 text-white">
      <CardHeader>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">TIMELINE</p>
          <h3 className="text-xl font-semibold">打った日々の記録</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-sm text-white/60">まだノリ打ちの記録がありません。右のフォームから最初の記録を追加しましょう。</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <article
                key={session.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-white/5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500 via-orange-400 to-indigo-500" />
                    <div>
                      <p className="text-xs text-white/60">{format(new Date(session.date), "yyyy/MM/dd")}</p>
                      <h4 className="text-lg font-semibold">{session.machineName}</h4>
                    </div>
                  </div>
                  {session.location && <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{session.location}</span>}
                  <span
                    className={cn(
                      "ml-auto rounded-full px-3 py-1 text-xs font-semibold",
                      session.net >= 0
                        ? "bg-emerald-400/20 text-emerald-100"
                        : "bg-amber-400/20 text-amber-100",
                    )}
                  >
                    {session.net >= 0 ? "+" : ""}
                    {session.net.toLocaleString()} 円
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-white/80">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs">投資 {session.totalInvest.toLocaleString()} 円</span>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs">回収 {session.totalPayout.toLocaleString()} 円</span>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs">1人あたり {session.perHead.toLocaleString()} 円</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {session.participants.map((p) => (
                      <span
                        key={p.userId}
                        className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/80"
                      >
                        {p.name} 投資 {p.invested.toLocaleString()} / 回収 {p.payout.toLocaleString()}
                      </span>
                    ))}
                  </div>
                  {session.note && (
                    <p className="text-xs text-white/60">メモ: {session.note}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
