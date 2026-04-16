import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/Navbar";

import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Lobby from "@/pages/Lobby";
import DuelArena from "@/pages/DuelArena";
import Results from "@/pages/Results";
import LeaderboardPage from "@/pages/LeaderboardPage";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={Auth} />
          <Route path="/lobby" component={Lobby} />
          <Route path="/duel/:id" component={DuelArena} />
          <Route path="/results/:id" component={Results} />
          <Route path="/leaderboard" component={LeaderboardPage} />
          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <TooltipProvider>
              <Toaster />
              <Router hook={useHashLocation}>
                <AppRouter />
              </Router>
            </TooltipProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
