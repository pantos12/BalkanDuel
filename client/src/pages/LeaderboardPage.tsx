import { useState } from "react";
import { motion } from "framer-motion";
import { mockPlayers } from "@/lib/mock-data";
import { Trophy, Medal, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

type TimeFilter = "all" | "week" | "today";

const filterLabels: Record<TimeFilter, string> = {
  all: "All Time",
  week: "This Week",
  today: "Today",
};

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<TimeFilter>("all");

  // Mock: same data for all filters with slight variations
  const players = mockPlayers.map((p, i) => ({
    ...p,
    wins: filter === "today" ? Math.floor(p.wins / 20) : filter === "week" ? Math.floor(p.wins / 4) : p.wins,
  }));

  const podium = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-xl" data-testid="text-leaderboard-title">
            Leaderboard
          </h1>
          <div className="flex gap-1 bg-card border border-border rounded-sm p-1">
            {(Object.keys(filterLabels) as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-display font-medium rounded-sm transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`filter-${f}`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-3 pt-4 pb-6">
          {/* 2nd place */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-14 h-14 rounded-sm bg-card border-2 border-border flex items-center justify-center font-display font-bold text-lg" data-testid="podium-2">
              {podium[1]?.username[0]}
            </div>
            <div className="text-sm font-medium mt-2 text-center truncate max-w-[80px]">
              {podium[1]?.username}
            </div>
            <div className="text-xs text-muted-foreground">{podium[1]?.wins}W</div>
            <div className="w-20 h-16 bg-muted/60 border border-border rounded-t-sm mt-2 flex items-center justify-center">
              <span className="text-2xl">🥈</span>
            </div>
          </motion.div>

          {/* 1st place */}
          <motion.div
            className="flex flex-col items-center -mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-16 h-16 rounded-sm bg-primary/10 border-2 border-primary flex items-center justify-center font-display font-bold text-xl" data-testid="podium-1">
              {podium[0]?.username[0]}
            </div>
            <div className="text-sm font-semibold mt-2 text-center truncate max-w-[100px]">
              {podium[0]?.username}
            </div>
            <div className="text-xs text-muted-foreground">{podium[0]?.wins}W</div>
            <div className="w-24 h-24 bg-primary/10 border border-primary/30 rounded-t-sm mt-2 flex items-center justify-center">
              <span className="text-3xl">🥇</span>
            </div>
          </motion.div>

          {/* 3rd place */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-14 h-14 rounded-sm bg-card border-2 border-border flex items-center justify-center font-display font-bold text-lg" data-testid="podium-3">
              {podium[2]?.username[0]}
            </div>
            <div className="text-sm font-medium mt-2 text-center truncate max-w-[80px]">
              {podium[2]?.username}
            </div>
            <div className="text-xs text-muted-foreground">{podium[2]?.wins}W</div>
            <div className="w-20 h-12 bg-muted/40 border border-border rounded-t-sm mt-2 flex items-center justify-center">
              <span className="text-2xl">🥉</span>
            </div>
          </motion.div>
        </div>

        {/* Rest of leaderboard */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="px-4 py-2.5 text-left font-medium w-12">#</th>
                <th className="px-4 py-2.5 text-left font-medium">Player</th>
                <th className="px-4 py-2.5 text-right font-medium">Wins</th>
                <th className="px-4 py-2.5 text-right font-medium">W/L</th>
                <th className="px-4 py-2.5 text-right font-medium">Streak</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((p, i) => (
                <motion.tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  data-testid={`row-leaderboard-${p.id}`}
                >
                  <td className="px-4 py-2.5 font-display font-bold text-muted-foreground">
                    {i + 4}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-sm bg-muted flex items-center justify-center text-xs font-bold">
                        {p.username[0]}
                      </div>
                      <span className="font-medium">{p.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium">{p.wins}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {p.losses > 0 ? (p.wins / p.losses).toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {p.streak > 0 ? (
                      <span className="text-primary font-semibold">{p.streak}🔥</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
