import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  mockPlayers,
  mockCurrentUser,
  mockActiveDuels,
  balkanEmotes,
} from "@/lib/mock-data";
import { Swords, LinkIcon, Trophy, Flame, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Lobby() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isMatchmaking, setIsMatchmaking] = useState(false);

  const currentUser = user
    ? { ...mockCurrentUser, username: user.username }
    : mockCurrentUser;

  function handleChallenge() {
    setIsMatchmaking(true);
    // Stub: POST /api/matchmaking/queue
    setTimeout(() => {
      setIsMatchmaking(false);
      navigate("/duel/demo-123");
    }, 1500);
  }

  function handleCreateLink() {
    // Stub: POST /api/challenge/create
    const fakeLink = `${window.location.origin}/#/duel/invite-abc`;
    navigator.clipboard?.writeText(fakeLink).catch(() => {});
    toast({
      title: "Challenge link copied!",
      description: "Send it to your brate and let the duel begin.",
    });
  }

  const topPlayers = mockPlayers.slice(0, 10);

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* User card */}
        <div className="flex items-center gap-4 bg-card border border-border rounded-sm p-4">
          <div
            className="w-12 h-12 rounded-sm bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg"
            data-testid="avatar-lobby-user"
          >
            {currentUser.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-base" data-testid="text-lobby-username">
              {currentUser.username}
            </h2>
            <div className="flex gap-4 text-sm text-muted-foreground mt-0.5">
              <span data-testid="stat-wins">
                <Trophy className="inline w-3.5 h-3.5 mr-1 text-warning" />
                {currentUser.wins}W / {currentUser.losses}L
              </span>
              <span data-testid="stat-streak">
                <Flame className="inline w-3.5 h-3.5 mr-1 text-primary" />
                {currentUser.streak} streak
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Button
            size="lg"
            className="font-display font-bold text-base rounded-sm h-14"
            onClick={handleChallenge}
            disabled={isMatchmaking}
            data-testid="button-challenge-random"
          >
            {isMatchmaking ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                FINDING OPPONENT...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Swords className="w-5 h-5" />
                CHALLENGE RANDOM OPPONENT
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="font-display font-medium text-base rounded-sm h-14 border-2"
            onClick={handleCreateLink}
            data-testid="button-create-link"
          >
            <LinkIcon className="w-5 h-5 mr-2" />
            CREATE CHALLENGE LINK
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Leaderboard panel */}
          <div className="lg:col-span-2 bg-card border border-border rounded-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-display font-semibold text-sm">TOP DUELISTS</h3>
              <Link href="/leaderboard" className="text-xs text-primary hover:underline" data-testid="link-full-leaderboard">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="px-4 py-2 font-medium w-12">#</th>
                    <th className="px-4 py-2 font-medium">Player</th>
                    <th className="px-4 py-2 font-medium text-right">Wins</th>
                    <th className="px-4 py-2 font-medium text-right">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlayers.map((p, i) => (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                      data-testid={`row-player-${p.id}`}
                    >
                      <td className="px-4 py-2.5 font-display font-bold text-muted-foreground">
                        {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-sm bg-muted flex items-center justify-center text-xs font-bold">
                            {p.username[0]}
                          </div>
                          <span className="font-medium">{p.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">{p.wins}</td>
                      <td className="px-4 py-2.5 text-right">
                        {p.streak > 0 && (
                          <span className="text-primary font-semibold">{p.streak}🔥</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right sidebar: emotes + live duels */}
          <div className="space-y-4">
            {/* Emote panel */}
            <div className="bg-card border border-border rounded-sm p-4">
              <h3 className="font-display font-semibold text-sm mb-3">TRASH TALK</h3>
              <div className="grid grid-cols-4 gap-2">
                {balkanEmotes.map((em) => (
                  <button
                    key={em.label}
                    className="flex flex-col items-center gap-1 p-2 rounded-sm hover:bg-accent transition-colors"
                    data-testid={`emote-${em.label.toLowerCase().replace(/\s/g, "-")}`}
                    title={em.label}
                    onClick={() => toast({ title: em.emoji, description: em.label })}
                  >
                    <span className="text-xl">{em.emoji}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight truncate w-full text-center">
                      {em.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active duels ticker */}
            <div className="bg-card border border-border rounded-sm overflow-hidden">
              <h3 className="font-display font-semibold text-sm px-4 py-3 border-b border-border">
                LIVE DUELS
              </h3>
              <div className="relative h-32 overflow-hidden">
                <div className="animate-marquee flex flex-col">
                  {[...mockActiveDuels, ...mockActiveDuels].map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm border-b border-border/50"
                    >
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="font-medium">{d.player1}</span>
                      <span className="text-primary font-display font-bold text-xs">VS</span>
                      <span className="font-medium">{d.player2}</span>
                      <span className="text-xs text-muted-foreground ml-auto">R{d.round}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
