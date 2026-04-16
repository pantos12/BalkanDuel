import { useState, useEffect, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { mockDuelState, mockQuestions, balkanEmotes } from "@/lib/mock-data";
import type { DuelState, Question } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const ROUND_TIME = 5; // seconds
const answerLabels = ["A", "B", "C", "D"];

function PlayerCard({
  name,
  score,
  side,
}: {
  name: string;
  score: number;
  side: "left" | "right";
}) {
  return (
    <div className={`flex items-center gap-3 ${side === "right" ? "flex-row-reverse" : ""}`}>
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-sm bg-card border-2 border-border flex items-center justify-center font-display font-bold text-lg text-foreground"
        data-testid={`avatar-${side}`}
      >
        {name[0].toUpperCase()}
      </div>
      <div className={side === "right" ? "text-right" : ""}>
        <div className="font-display font-semibold text-sm text-[hsl(30_10%_88%)] truncate max-w-[100px] sm:max-w-none" data-testid={`name-${side}`}>
          {name}
        </div>
        <div className="font-display font-bold text-xl text-[hsl(5_80%_58%)]" data-testid={`score-${side}`}>
          {score}
        </div>
      </div>
    </div>
  );
}

function WaitingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Skeleton className="w-64 h-8 rounded-sm" />
      <Skeleton className="w-48 h-6 rounded-sm" />
      <div className="flex gap-3 mt-4">
        <Skeleton className="w-14 h-14 rounded-sm" />
        <Skeleton className="w-20 h-6 rounded-sm self-center" />
        <Skeleton className="w-14 h-14 rounded-sm" />
      </div>
      <p className="text-[hsl(30_6%_52%)] font-display mt-4 animate-pulse">
        Waiting for opponent...
      </p>
    </div>
  );
}

export default function DuelArena() {
  const [, params] = useRoute("/duel/:id");
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [duel, setDuel] = useState<DuelState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [roundRevealed, setRoundRevealed] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setDuel(mockDuelState);
      setCurrentQuestion(mockQuestions[mockDuelState.currentRound - 1] || mockQuestions[0]);
      setIsWaiting(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isWaiting || roundRevealed || !currentQuestion) return;
    if (timeLeft <= 0) {
      setRoundRevealed(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 0.05));
    }, 50);
    return () => clearInterval(interval);
  }, [timeLeft, isWaiting, roundRevealed, currentQuestion]);

  const handleAnswer = useCallback(
    (index: number) => {
      if (selectedAnswer !== null || roundRevealed) return;
      setSelectedAnswer(index);
      setRoundRevealed(true);

      // Stub: emit answer via socket
      // After a delay, go to next round or results
      setTimeout(() => {
        if (duel && duel.currentRound >= duel.totalRounds) {
          navigate(`/results/${duel.id}`);
        } else {
          // Reset for next round (mock)
          setSelectedAnswer(null);
          setRoundRevealed(false);
          setTimeLeft(ROUND_TIME);
          const nextRound = (duel?.currentRound || 0) + 1;
          setCurrentQuestion(mockQuestions[nextRound - 1] || mockQuestions[0]);
          setDuel((prev) =>
            prev ? { ...prev, currentRound: nextRound } : prev
          );
        }
      }, 2000);
    },
    [selectedAnswer, roundRevealed, duel, navigate]
  );

  function sendEmote(emoji: string, label: string) {
    // Stub: emit emote via socket
    toast({ title: emoji, description: `You sent: ${label}` });
  }

  if (isWaiting) {
    return (
      <div className="min-h-screen bg-[hsl(20_12%_8%)] ottoman-pattern">
        <WaitingState />
      </div>
    );
  }

  if (!duel || !currentQuestion) return null;

  const p1 = duel.player1;
  const p2 = duel.player2;

  return (
    <div className="min-h-screen bg-[hsl(20_12%_8%)] ottoman-pattern flex flex-col">
      {/* Header bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[hsl(20_8%_16%)]">
        <div className="text-xs text-[hsl(30_6%_52%)] font-display font-medium">
          ROUND {duel.currentRound}/{duel.totalRounds}
        </div>
        <div className="text-xs text-[hsl(30_6%_52%)]">
          Duel #{params?.id?.slice(0, 8)}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6 max-w-2xl mx-auto w-full">
        {/* Players row */}
        <div className="w-full flex items-center justify-between">
          <PlayerCard name={p1.username} score={duel.player1Score} side="left" />
          <motion.div
            className="font-display font-bold text-2xl text-[hsl(5_80%_58%)]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.4 }}
            key={duel.currentRound}
          >
            VS
          </motion.div>
          <PlayerCard name={p2.username} score={duel.player2Score} side="right" />
        </div>

        {/* Timer bar */}
        <div className="w-full h-2 bg-[hsl(20_8%_16%)] rounded-sm overflow-hidden">
          <motion.div
            className="h-full rounded-sm"
            style={{
              width: `${(timeLeft / ROUND_TIME) * 100}%`,
              backgroundColor:
                timeLeft > 2
                  ? "hsl(145, 55%, 35%)"
                  : timeLeft > 1
                  ? "hsl(38, 90%, 48%)"
                  : "hsl(5, 85%, 45%)",
            }}
            transition={{ duration: 0.05, ease: "linear" }}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            className="w-full bg-[hsl(20_10%_11%)] border-2 border-[hsl(20_8%_20%)] rounded-sm p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <p
              className="text-base font-medium text-[hsl(30_10%_88%)] text-center leading-relaxed"
              data-testid="text-question"
            >
              {currentQuestion.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Answer buttons */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((opt, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect = i === currentQuestion.correctIndex;
            const showResult = roundRevealed;

            let btnClass =
              "relative w-full text-left p-4 rounded-sm border-2 font-medium text-sm transition-all ";

            if (showResult && isCorrect) {
              btnClass +=
                "border-[hsl(145_55%_35%)] bg-[hsl(145_55%_35%/0.15)] text-[hsl(145_55%_35%)]";
            } else if (showResult && isSelected && !isCorrect) {
              btnClass +=
                "border-[hsl(5_85%_45%)] bg-[hsl(5_85%_45%/0.15)] text-[hsl(5_85%_45%)]";
            } else if (isSelected) {
              btnClass += "border-[hsl(5_80%_58%)] bg-[hsl(5_80%_58%/0.1)] text-[hsl(30_10%_88%)]";
            } else {
              btnClass +=
                "border-[hsl(20_8%_20%)] bg-[hsl(20_10%_11%)] text-[hsl(30_10%_88%)] hover:border-[hsl(5_80%_58%/0.5)] hover:bg-[hsl(20_8%_13%)]";
            }

            return (
              <motion.button
                key={i}
                className={btnClass}
                onClick={() => handleAnswer(i)}
                disabled={selectedAnswer !== null}
                whileTap={{ scale: 0.98 }}
                data-testid={`button-answer-${answerLabels[i]}`}
              >
                <span className="font-display font-bold text-xs mr-2 opacity-50">
                  {answerLabels[i]}
                </span>
                {opt}
              </motion.button>
            );
          })}
        </div>

        {/* Emote bar */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          {balkanEmotes.slice(0, 6).map((em) => (
            <button
              key={em.label}
              className="w-9 h-9 rounded-sm bg-[hsl(20_8%_16%)] hover:bg-[hsl(20_8%_20%)] flex items-center justify-center text-base transition-colors"
              onClick={() => sendEmote(em.emoji, em.label)}
              title={em.label}
              data-testid={`emote-arena-${em.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              {em.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
