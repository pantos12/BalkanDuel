import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { balkanEmotes } from "@/lib/mock-data";
import { Swords, LinkIcon, Trophy, Flame, Copy, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LeaderboardPlayer {
  id: number;
  username: string;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  totalPoints: number;
}

interface Stats {
  totalDuels: number;
  activeDuels: number;
  totalPlayers: number;
}

export default function Lobby() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [challengeLink, setChallengeLink] = useState<string | null>(null);

  // Fetch leaderboard from real API
  const { data: leaderboard = [] } = useQuery<LeaderboardPlayer[]>({
    queryKey: ["/api/leaderboard"],
  });

  // Fetch stats
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  // Listen for match_found from socket
  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (data: { duelId: string }) => {
      setIsMatchmaking(false);
      navigate(`/duel/${data.duelId}`);
    };

    socket.on("match_found", handleMatchFound);
    return () => {
      socket.off("match_found", handleMatchFound);
    };
  }, [socket, navigate]);

  const handleChallenge = useCallback(() => {
    if (!socket || !user) return;
    setIsMatchmaking(true);
    socket.emit("join_lobby");
  }, [socket, user]);

  const handleCancelMatchmaking = useCallback(() => {
    if (!socket) return;
    setIsMatchmaking(false);
    socket.emit("leave_lobby");
  }, [socket]);

  async function handleCreateLink() {
    if (!user) return;
    try {
      const res = await apiRequest("POST", "/api/duels", undefined);
      const data = await res.json();
      const link = `${window.location.origin}/#/duel/${data.duelId}`;
      setChallengeLink(link);
      try { await navigator.clipboard.writeText(link); } catch {}
      toast({
        title: "Challenge link created!",
        description: "Send it to your brate and let the duel begin.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to create challenge",
        description: err?.message || "Try again",
        variant: "destructive",
      });
    }
  }

  // We need to pass the auth token for apiRequest calls
  // The queryClient's default queryFn uses raw fetch without auth headers.
  // We'll add auth headers via a custom hook approach, or just accept
  // that leaderboard/stats are public endpoints (no auth needed).

  const topPlayers = leaderboard.slice(0, 10);

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
            {user?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-base" data-testid="text-lobby-username">
              {user?.username ?? "Guest"}
            </h2>
            <div className="flex gap-4 text-sm text-muted-foreground mt-0.5">
              {stats && (
                <>
                  <span data-testid="stat-players">
                    <Trophy className="inline w-3.5 h-3.5 mr-1 text-warning" />
                    {stats.totalPlayers} players
                  </span>
                  <span data-testid="stat-duels">
                    <Flame className="inline w-3.5 h-3.5 mr-1 text-primary" />
                    {stats.totalDuels} duels
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Button
            size="lg"
            className="font-display font-bold text-base rounded-sm h-14"
            onClick={isMatchmaking ? handleCancelMatchmaking : handleChallenge}
            data-testid="button-challenge-random"
          >
            {isMatchmaking ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                LOOKING FOR OPPONENT...
                <X className="w-4 h-4 ml-1" />
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

        {/* Challenge link display */}
        {challengeLink && (
          <div className="bg-card border border-border rounded-sm p-4 flex items-center gap-3">
            <div className="flex-1 text-sm font-mono truncate text-muted-foreground" data-testid="text-challenge-link">
              {challengeLink}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                try { navigator.clipboard.writeText(challengeLink); } catch {}
                toast({ title: "Copied!" });
              }}
              data-testid="button-copy-link"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        )}

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
                  {topPlayers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground text-sm">
                        No players yet. Be the first!
                      </td>
                    </tr>
                  )}
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
                        {p.currentStreak > 0 && (
                          <span className="text-primary font-semibold">{p.currentStreak}🔥</span>
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

            {/* Stats panel */}
            <div className="bg-card border border-border rounded-sm p-4">
              <h3 className="font-display font-semibold text-sm mb-3">ARENA STATS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Duels</span>
                  <span className="font-medium" data-testid="stat-total-duels">{stats?.totalDuels ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Now</span>
                  <span className="font-medium" data-testid="stat-active-duels">{stats?.activeDuels ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Players</span>
                  <span className="font-medium" data-testid="stat-total-players">{stats?.totalPlayers ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
