import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { fetchFriends } from "@/entities/friend/queries";
import { fetchSessionsForUser } from "@/entities/nori-session/queries";
import { DashboardClient } from "@/widgets/dashboard/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const [friends, sessions] = await Promise.all([
    fetchFriends(session.user.id),
    fetchSessionsForUser(session.user.id),
  ]);

  async function handleSignOut() {
    "use server";
    await signOut();
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-8 text-white md:px-8">
      <header className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg shadow-black/20">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.2em] text-white/60">Signed in</span>
          <span className="text-sm font-semibold">{session.user?.name ?? session.user?.email}</span>
        </div>
        <form className="ml-auto" action={handleSignOut}>
          <button
            type="submit"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
          >
            サインアウト
          </button>
        </form>
      </header>

      <DashboardClient
        sessions={sessions}
        friends={friends}
        currentUser={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />
    </main>
  );
}
