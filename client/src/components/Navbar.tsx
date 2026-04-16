import { Link, useLocation } from "wouter";
import { SwordsLogo } from "./SwordsLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  // Hide navbar on landing page and duel arena
  if (location === "/" || location.startsWith("/duel/")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="flex items-center justify-between px-4 h-14 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 no-underline" data-testid="link-home">
          <SwordsLogo size={28} className="text-primary" />
          <span className="font-display font-bold text-base tracking-tight text-foreground">
            BALKAN DUEL
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-display"
                  data-testid="avatar-user"
                >
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:inline" data-testid="text-username">
                  {user.username}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                data-testid="button-logout"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </nav>
    </header>
  );
}
