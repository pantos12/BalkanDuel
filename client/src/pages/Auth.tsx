import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { SwordsLogo } from "@/components/SwordsLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "" });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast({ title: "Ma hajde...", description: "Fill in all fields, brate.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    // Stub: POST /api/auth/login
    await new Promise((r) => setTimeout(r, 600));
    login({ id: 99, username: loginForm.username, token: "mock-token-123" });
    setIsLoading(false);
    navigate("/lobby");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!registerForm.username || !registerForm.password) {
      toast({ title: "Ma hajde...", description: "Fill in all fields, brate.", variant: "destructive" });
      return;
    }
    if (registerForm.password.length < 4) {
      toast({ title: "Too short!", description: "Password needs at least 4 characters.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    // Stub: POST /api/auth/register
    await new Promise((r) => setTimeout(r, 600));
    login({ id: 99, username: registerForm.username, token: "mock-token-456" });
    setIsLoading(false);
    navigate("/lobby");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo header */}
        <div className="flex flex-col items-center mb-8">
          <SwordsLogo size={48} className="text-primary mb-3" />
          <h1 className="font-display font-bold text-xl">BALKAN DUEL</h1>
          <p className="text-sm text-muted-foreground mt-1">No email needed. Just vibes.</p>
        </div>

        <div className="bg-card border border-border rounded-sm p-6">
          <Tabs defaultValue="login">
            <TabsList className="w-full mb-6 rounded-sm">
              <TabsTrigger value="login" className="flex-1 font-display font-medium rounded-sm" data-testid="tab-login">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1 font-display font-medium rounded-sm" data-testid="tab-register">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-username" className="text-sm font-medium">Username</Label>
                  <Input
                    id="login-username"
                    placeholder="ČevapiKing"
                    className="mt-1 rounded-sm"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    data-testid="input-login-username"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••"
                    className="mt-1 rounded-sm"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    data-testid="input-login-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full font-display font-bold rounded-sm"
                  disabled={isLoading}
                  data-testid="button-submit-login"
                >
                  {isLoading ? "Entering..." : "ENTER THE ARENA"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-username" className="text-sm font-medium">Choose Username</Label>
                  <Input
                    id="register-username"
                    placeholder="RakijaMaster"
                    className="mt-1 rounded-sm"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    data-testid="input-register-username"
                  />
                </div>
                <div>
                  <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••"
                    className="mt-1 rounded-sm"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    data-testid="input-register-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full font-display font-bold rounded-sm"
                  disabled={isLoading}
                  data-testid="button-submit-register"
                >
                  {isLoading ? "Creating..." : "JOIN THE FIGHT"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
