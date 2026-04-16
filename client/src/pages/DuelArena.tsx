import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { balkanEmotes } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const answerLabels = ["A", "B", "C", "D"];

interface BrainQuestion {
  id: string;
  text: string;
  options: [string, string, string, string];
  category: string;
  difficulty: string;
  timeLimit: number;
}

interface RoundStartData {
  duelId: string;
  round: number;
  totalRounds: number;
  question: BrainQuestion;
}

interface RoundResultData {
  duelId: string;
  round: number;
  winner: 0 | 1 | null;
  p1Points: number;
  p2Points: number;
  correctIndex: number;
  funFact?: string;
  p1Score: number;
  p2Score: number;
  p1RoundsWon: number;
  p2RoundsWon: number;
}

interface DuelOverData {
  duelId: string;
  winner: 0 | 1 | null;
  winnerUsername: string | null;
  p1Score: number;
  p2Score: number;
  p1RoundsWon: number;
  p2RoundsWon: number;
  reason?: string;
}

interface DuelStateData {
  duelId: string;
  status: string;
  players: Array<{ userId: number; username: string; score: number; roundsWon: number }>;
  currentRound: number;
  totalRounds: number;
}

function PlayerCard({
  name,
  score,
  roundsWon,
  side,
}: {
  name: string;
  score: number;
  roundsWon: number;
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
          {roundsWon}
        </div>
        <div className="text-xs text-[hsl(30_6%_52%)]">{score} pts</div>
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

function CountdownOverlay({ seconds }: { seconds: number }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="font-display font-bold text-[hsl(5_80%_58%)]"
        style={{ fontSize: "clamp(4rem, 20vw, 10rem)" }}
        key={seconds}
        initial={{ scale: 2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {seconds}
      </motion.div>
    </motion.div>
  );
}

export default function DuelArena() {
  const [, params] = useRoute("/duel/:id");
  const { user } = useAuth();
  const { socket } = useSocket();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const duelId = params?.id ?? "";

  const [duelState, setDuelState] = useState<DuelStateData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<BrainQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(8);
  const [roundRevealed, setRoundRevealed] = useState(false);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [funFact, setFunFact] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [roundResult, setRoundResult] = useState<RoundResultData | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Join the duel room on mount
  useEffect(() => {
    if (!socket || !duelId) return;
    socket.emit("join_duel", { duelId });
  }, [socket, duelId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleDuelState = (data: DuelStateData) => {
      setDuelState(data);
      if (data.status !== "waiting") {
        setIsWaiting(false);
      }
    };

    const handleCountdown = (data: { duelId: string; seconds: number }) => {
      setIsWaiting(false);
      setCountdown(data.seconds);
      // Countdown timer
      let c = data.seconds;
      const iv = setInterval(() => {
        c--;
        if (c <= 0) {
          clearInterval(iv);
          setCountdown(null);
        } else {
          setCountdown(c);
        }
      }, 1000);
    };

    const handleRoundStart = (data: RoundStartData) => {
      setCountdown(null);
      setCurrentQuestion(data.question);
      setCurrentRound(data.round);
      setTotalRounds(data.totalRounds);
      setSelectedAnswer(null);
      setRoundRevealed(false);
      setCorrectIndex(null);
      setFunFact(null);
      setRoundResult(null);
      setTimeLeft(data.question.timeLimit);
      setTotalTime(data.question.timeLimit);

      // Start visual timer
      if (timerRef.current) clearInterval(timerRef.current);
      let t = data.question.timeLimit;
      timerRef.current = setInterval(() => {
        t -= 0.05;
        if (t <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeLeft(0);
        } else {
          setTimeLeft(t);
        }
      }, 50);
    };

    const handleAnswerReceived = (data: { isCorrect: boolean; points: number }) => {
      // Our answer was acknowledged
    };

    const handleRoundResult = (data: RoundResultData) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setRoundRevealed(true);
      setCorrectIndex(data.correctIndex);
      setFunFact(data.funFact || null);
      setRoundResult(data);
    };

    const handleDuelOver = (data: DuelOverData) => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Navigate to results page with duel data
      navigate(`/results/${data.duelId}`);
    };

    const handleEmoteReceived = (data: { fromUsername: string; emote: string }) => {
      toast({ title: data.emote, description: `${data.fromUsername} says:` });
    };

    const handleError = (data: { message: string }) => {
      toast({ title: "Error", description: data.message, variant: "destructive" });
    };

    socket.on("duel_state", handleDuelState);
    socket.on("countdown", handleCountdown);
    socket.on("round_start", handleRoundStart);
    socket.on("answer_received", handleAnswerReceived);
    socket.on("round_result", handleRoundResult);
    socket.on("duel_over", handleDuelOver);
    socket.on("emote_received", handleEmoteReceived);
    socket.on("error", handleError);

    return () => {
      socket.off("duel_state", handleDuelState);
      socket.off("countdown", handleCountdown);
      socket.off("round_start", handleRoundStart);
      socket.off("answer_received", handleAnswerReceived);
      socket.off("round_result", handleRoundResult);
      socket.off("duel_over", handleDuelOver);
      socket.off("emote_received", handleEmoteReceived);
      socket.off("error", handleError);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [socket, navigate, toast]);

  const handleAnswer = useCallback(
    (index: number) => {
      if (selectedAnswer !== null || roundRevealed || !socket || !duelId) return;
      setSelectedAnswer(index);
      socket.emit("submit_answer", {
        duelId,
        answerIndex: index,
        timestamp: Date.now(),
      });
    },
    [selectedAnswer, roundRevealed, socket, duelId]
  );

  function sendEmote(emoji: string, label: string) {
    if (!socket || !duelId) return;
    socket.emit("send_emote", { duelId, emote: emoji });
  }

  if (isWaiting) {
    return (
      <div className="min-h-screen bg-[hsl(20_12%_8%)] ottoman-pattern">
        <WaitingState />
      </div>
    );
  }

  const p1 = duelState?.players?.[0];
  const p2 = duelState?.players?.[1];
  const p1Name = p1?.username ?? "Player 1";
  const p2Name = p2?.username ?? "Player 2";
  const p1Score = roundResult?.p1Score ?? p1?.score ?? 0;
  const p2Score = roundResult?.p2Score ?? p2?.score ?? 0;
  const p1Rounds = roundResult?.p1RoundsWon ?? p1?.roundsWon ?? 0;
  const p2Rounds = roundResult?.p2RoundsWon ?? p2?.roundsWon ?? 0;

  return (
    <div className="min-h-screen bg-[hsl(20_12%_8%)] ottoman-pattern flex flex-col">
      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <CountdownOverlay seconds={countdown} />
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[hsl(20_8%_16%)]">
        <div className="text-xs text-[hsl(30_6%_52%)] font-display font-medium">
          ROUND {currentRound}/{totalRounds}
        </div>
        <div className="text-xs text-[hsl(30_6%_52%)]">
          {currentQuestion?.category ?? ""}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6 max-w-2xl mx-auto w-full">
        {/* Players row */}
        <div className="w-full flex items-center justify-between">
          <PlayerCard name={p1Name} score={p1Score} roundsWon={p1Rounds} side="left" />
          <motion.div
            className="font-display font-bold text-2xl text-[hsl(5_80%_58%)]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.4 }}
            key={currentRound}
          >
            VS
          </motion.div>
          <PlayerCard name={p2Name} score={p2Score} roundsWon={p2Rounds} side="right" />
        </div>

        {/* Timer bar */}
        {currentQuestion && (
          <div className="w-full h-2 bg-[hsl(20_8%_16%)] rounded-sm overflow-hidden">
            <motion.div
              className="h-full rounded-sm"
              style={{
                width: `${(timeLeft / totalTime) * 100}%`,
                backgroundColor:
                  timeLeft > totalTime * 0.4
                    ? "hsl(145, 55%, 35%)"
                    : timeLeft > totalTime * 0.2
                    ? "hsl(38, 90%, 48%)"
                    : "hsl(5, 85%, 45%)",
              }}
              transition={{ duration: 0.05, ease: "linear" }}
            />
          </div>
        )}

        {/* Question card */}
        {currentQuestion && (
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
        )}

        {/* Answer buttons */}
        {currentQuestion && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = correctIndex !== null && i === correctIndex;
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
                  disabled={selectedAnswer !== null || roundRevealed}
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
        )}

        {/* Fun fact after round reveal */}
        {roundRevealed && funFact && (
          <motion.div
            className="w-full bg-[hsl(20_10%_11%)] border border-[hsl(38_90%_48%/0.3)] rounded-sm p-4 text-sm text-[hsl(30_10%_88%)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="font-display font-semibold text-[hsl(38_90%_48%)] mr-1">Fun fact:</span>
            {funFact}
          </motion.div>
        )}

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
