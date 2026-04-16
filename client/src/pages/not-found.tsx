import { Link } from "wouter";
import { motion } from "framer-motion";
import { SwordsLogo } from "@/components/SwordsLogo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <SwordsLogo size={56} className="text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display font-bold text-xl mb-2">404 — Lost in the Balkans</h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
          This page doesn't exist. Maybe it got lost somewhere between Belgrade and Sarajevo.
        </p>
        <Link href="/">
          <Button className="font-display font-bold rounded-sm" data-testid="button-go-home">
            BACK TO HOME
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
