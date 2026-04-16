import { Link } from "wouter";
import { motion } from "framer-motion";
import { SwordsLogo } from "@/components/SwordsLogo";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Zap, Trophy, Users, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Active Players", value: "1,247" },
  { label: "Duels Today", value: "8,931" },
];

const features = [
  {
    icon: Zap,
    title: "5 Rounds, 5 Seconds",
    desc: "Lightning-fast trivia rounds. No time to Google — you either know it or you don't.",
  },
  {
    icon: Trophy,
    title: "Climb the Ranks",
    desc: "Win streaks, leaderboards, bragging rights. Become the ultimate Balkan trivia champion.",
  },
  {
    icon: Users,
    title: "Challenge Anyone",
    desc: "Random matchmaking or send a challenge link to your brate. Trash-talk emotes included.",
  },
  {
    icon: Timer,
    title: "Real-Time Duels",
    desc: "Both players answer simultaneously. The faster correct answer wins the round.",
  },
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — dark dramatic section */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[hsl(20_12%_8%)] text-[hsl(30_10%_88%)] ottoman-pattern">
        {/* Theme toggle floating */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 z-20 p-2 rounded-sm text-[hsl(30_6%_52%)] hover:text-[hsl(30_10%_88%)] transition-colors"
          data-testid="button-theme-toggle-landing"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Animated swords logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
        >
          <SwordsLogo size={80} className="text-[hsl(5_80%_58%)]" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-display font-bold text-center mt-6 leading-none tracking-tight"
          style={{ fontSize: "clamp(2.5rem, 1rem + 6vw, 5rem)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          BALKAN DUEL <span className="inline-block">⚔️</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-4 text-base text-[hsl(30_6%_52%)] text-center max-w-md px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          The most intense 1v1 trivia battle in the Balkans
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex gap-3 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Link href="/auth">
            <Button
              size="lg"
              className="font-display font-bold text-base tracking-wide bg-[hsl(5_80%_58%)] hover:bg-[hsl(5_80%_50%)] text-white rounded-sm px-8"
              data-testid="button-start-duel"
            >
              START DUEL
            </Button>
          </Link>
          <Link href="/auth">
            <Button
              variant="outline"
              size="lg"
              className="font-display font-medium text-base tracking-wide rounded-sm px-8 border-[hsl(20_8%_20%)] text-[hsl(30_10%_88%)] hover:bg-[hsl(20_8%_16%)]"
              data-testid="button-login"
            >
              LOGIN
            </Button>
          </Link>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          className="flex gap-8 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-bold text-xl text-[hsl(5_80%_58%)]" data-testid={`stat-${s.label.toLowerCase().replace(" ", "-")}`}>
                {s.value}
              </div>
              <div className="text-xs text-[hsl(30_6%_52%)] mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <div className="w-5 h-8 border-2 border-[hsl(20_8%_20%)] rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-[hsl(30_6%_52%)] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-xl text-center mb-12">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="p-6 bg-card border border-border rounded-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <f.icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-display font-semibold text-base mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="py-16 px-4 bg-card border-t border-border">
        <div className="max-w-md mx-auto text-center">
          <h2 className="font-display font-bold text-lg mb-3">
            Ready to prove yourself?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Join thousands of players in the ultimate Balkan knowledge showdown. Ajde!
          </p>
          <Link href="/auth">
            <Button
              size="lg"
              className="font-display font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm px-8"
              data-testid="button-cta-bottom"
            >
              ENTER THE ARENA
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
