import Link from "next/link";

import { auth, signIn } from "@/auth";
import { Button } from "@/shared/ui/button";
import { Card, CardBody } from "@/shared/ui/card";

export default async function Home() {
  const session = await auth();

  async function handleSignIn() {
    "use server";
    await signIn("google");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-4 pb-20 pt-16 text-white md:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">Pachinko / Slot</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            ノリ打ちの投資・回収を
            <span className="block text-transparent bg-gradient-to-r from-[#ff9ae1] via-[#ffc857] to-[#7c7cff] bg-clip-text">美しく、迷わず記録</span>
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            Google アカウントでサインインし、フレンドと共有できる収支ダッシュボードを数秒で作成。日付と機種、投資・回収を入力するだけで、自動的に総投資・総回収・分配額を計算し、タイムラインやグラフで振り返れます。
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <form action={handleSignIn}>
              <Button className="px-6 py-3 text-base shadow-lg shadow-fuchsia-500/40">Googleで始める</Button>
            </form>
            {session?.user && (
              <Link
                href="/dashboard"
                className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
              >
                ダッシュボードへ戻る
              </Link>
            )}
            <p className="text-sm text-white/60">インストール不要・無料でスタート</p>
          </div>
        </div>

        <Card className="bg-white/5">
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">リアルタイム集計</p>
                <p className="text-xl font-semibold">ノリ打ちの分配額を自動計算</p>
              </div>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-100">Neon + Prisma</span>
            </div>
            <ul className="space-y-3 text-sm text-white/80">
              <Feature text="Google認証のみで安全にログイン" />
              <Feature text="フレンド登録して同じ結果を共有" />
              <Feature text="投資・回収を入力すると総額/分配を即時計算" />
              <Feature text="タイムライン + 日別グラフで推移を把握" />
              <Feature text="FSD構成 / Tailwind 4 / Next.js 16" />
            </ul>
            <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs">総投資</p>
                <p className="text-2xl font-semibold">¥45,000</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs">分配 (1人あたり)</p>
                <p className="text-2xl font-semibold">+¥6,200</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>
    </main>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-amber-300" aria-hidden />
      {text}
    </li>
  );
}
