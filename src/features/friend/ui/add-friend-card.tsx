"use client";

import { useState, useTransition } from "react";

import { addFriendAction } from "@/features/friend/actions";
import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader } from "@/shared/ui/card";

export function AddFriendCard() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setMessage("");
    startTransition(async () => {
      const res = await addFriendAction({ email });
      if (res.ok) {
        setMessage(res.message ?? "フレンドを追加しました");
        setEmail("");
      } else {
        setMessage(res.message ?? "追加に失敗しました");
      }
    });
  };

  return (
    <Card className="bg-white/5 text-white">
      <CardHeader className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-white/70">FRIEND</p>
        <h3 className="text-xl font-semibold">フレンドを登録</h3>
        {message && <p className="text-sm text-emerald-200">{message}</p>}
      </CardHeader>
      <CardBody className="grid gap-3">
        <label className="grid gap-2 text-sm font-medium text-white/80">
          Google アカウントのメールアドレス
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@example.com"
            className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-white shadow-inner shadow-white/10 focus:border-fuchsia-300 focus:outline-none"
          />
        </label>
        <Button
          onClick={handleSubmit}
          disabled={isPending || !email}
          className="justify-center"
        >
          {isPending ? "送信中..." : "フレンド申請/承認"}
        </Button>
        <p className="text-xs text-white/60">
          登録済みユーザーのメールを指定すると、即時にフレンド登録されます。重複登録は自動でスキップされます。
        </p>
      </CardBody>
    </Card>
  );
}
