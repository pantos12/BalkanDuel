import { useState, useEffect, useMemo } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { mockFinishedDuel } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Copy, Swords, ArrowRight } from "lucide-react";

function ConfettiPiece({ index }: { index: number }) {
  const colors = [
    "hsl(5, 85%, 45%)",
    "hsl(38, 90%, 48%)",
    "hsl(145, 55%, 35%)",
    "hsl(5, 80%, 58%)",
    "hsl(38, 90%, 58%)",
  ];
  const style = useMemo(
    () => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
      backgroundColor: colors[index % colors.length],
      width: `${6 + Math.random() * 8}px`,
      height: `${6 + Math.random() * 8}px`,
    }),
    [index]
  );

  return (
    <div
      className="absolute top-0 rounded-sm"
      style={{
        ...style,
        animation: `confetti-fall ${style.animationDuration} ease-out ${style.animationDelay} forwards`,
      }}
    />
  );
}

export default function Results() {
  const [, params] = useRoute("/results/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);

  const duel = mockFinishedDuel;
  const p1 = duel.player1;
  const p2 = duel.player2;
  const p1Won = duel.player1Score > duel.player2Score;
  const isTie = duel.player1Score === duel.player2Score;
  const winnerName = p1Won ? p1.username : p2.username;
  const loserName = p1Won ? p2.username : p1.username;

  // Build share text
  const roundSquares = duel.rounds
    .map((r) => {
      if (r.player1Correct && !r.player2Correct) return "🟩";
      if (!r.player1Correct && r.player2Correct) return "🟥";
      return "🟨";
    })
    .join("");

  const shareText = isTie
    ? `Tied in Balkan Duel! 🤝 SCORE: ${duel.player1Score}-${duel.player2Score}\n${roundSquares}\nPlay at balkanduel.gg`
    : `I beat @${loserName} in Balkan Duel! 🏆 SCORE: ${duel.player1Score}-${duel.player2Score}\n${roundSquares}\nPlay at balkanduel.gg`;

  function copyShareText() {
    navigator.clipboard?.writeText(shareText).catch(() => {});
    toast({ title: "Copied!", description: "Share it everywhere, brate." });
    setShowShareModal(false);
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Confetti */}
      {p1Won && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      <div className="relative z-20 max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Winner announcement */}
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {isTie ? (
            <div className="font-display font-bold text-xl text-warning" data-testid="text-result-header">
              IT'S A TIE!
            </div>
          ) : (
            <>
              <Trophy className="w-10 h-10 text-warning mx-auto mb-2" />
              <div className="font-display font-bold text-xl" data-testid="text-result-header">
                {p1Won ? (
                  <span className="text-success">VICTORY!</span>
                ) : (
                  <span className="text-destructive">DEFEAT</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-1" data-testid="text-winner-name">
                {winnerName} wins the duel
              </div>
            </>
          )}
        </motion.div>

        {/* Score display */}
        <motion.div
          className="flex items-center justify-center gap-6 py-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-sm bg-card border-2 border-border flex items-center justify-center font-display font-bold text-lg mx-auto"
              data-testid="avatar-result-p1"
            >
              {p1.username[0]}
            </div>
            <div className="font-medium text-sm mt-2">{p1.username}</div>
            <div className="font-display font-bold text-2xl text-primary mt-1" data-testid="score-result-p1">
              {duel.player1Score}
            </div>
          </div>
          <div className="font-display font-bold text-muted-foreground text-lg">—</div>
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-sm bg-card border-2 border-border flex items-center justify-center font-display font-bold text-lg mx-auto"
              data-testid="avatar-result-p2"
            >
              {p2.username[0]}
            </div>
            <div className="font-medium text-sm mt-2">{p2.username}</div>
            <div className="font-display font-bold text-2xl text-primary mt-1" data-testid="score-result-p2">
              {duel.player2Score}
            </div>
          </div>
        </motion.div>

        {/* Round breakdown */}
        <motion.div
          className="bg-card border border-border rounded-sm overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-display font-semibold text-sm">ROUND BREAKDOWN</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="px-4 py-2 text-left font-medium">Round</th>
                <th className="px-4 py-2 text-center font-medium">{p1.username}</th>
                <th className="px-4 py-2 text-center font-medium">{p2.username}</th>
              </tr>
            </thead>
            <tbody>
              {duel.rounds.map((r) => (
                <tr key={r.round} className="border-b border-border last:border-0" data-testid={`row-round-${r.round}`}>
                  <td className="px-4 py-2.5 font-display font-medium">R{r.round}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-block w-6 h-6 leading-6 text-center rounded-sm text-xs font-bold ${
                        r.player1Correct
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {r.player1Correct ? "✓" : "✗"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {r.player1Time.toFixed(1)}s
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-block w-6 h-6 leading-6 text-center rounded-sm text-xs font-bold ${
                        r.player2Correct
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {r.player2Correct ? "✓" : "✗"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {r.player2Time.toFixed(1)}s
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Share result */}
        <motion.div
          className="space-y-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="outline"
            className="w-full font-display font-medium rounded-sm border-2"
            onClick={() => setShowShareModal(true)}
            data-testid="button-share-result"
          >
            <Copy className="w-4 h-4 mr-2" />
            SHARE RESULT
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/duel/rematch-123">
              <Button className="w-full font-display font-bold rounded-sm" data-testid="button-rematch">
                <Swords className="w-4 h-4 mr-2" />
                REMATCH
              </Button>
            </Link>
            <Link href="/lobby">
              <Button variant="secondary" className="w-full font-display font-medium rounded-sm" data-testid="button-new-opponent">
                NEW OPPONENT
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Share modal */}
        {showShareModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className="bg-card border-2 border-border rounded-sm p-6 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display font-bold text-base mb-3">Share Your Victory</h3>
              <div className="bg-background border border-border rounded-sm p-4 font-mono text-sm whitespace-pre-wrap mb-4" data-testid="text-share-card">
                {shareText}
              </div>
              <Button
                className="w-full font-display font-bold rounded-sm"
                onClick={copyShareText}
                data-testid="button-copy-share"
              >
                <Copy className="w-4 h-4 mr-2" />
                COPY TO CLIPBOARD
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
