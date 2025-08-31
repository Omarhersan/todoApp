"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "./darkModeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth/login";
  };

  return (
    <nav className="w-full flex justify-between items-center p-6 bg-card/90 backdrop-blur-lg border border-border/30 rounded-2xl shadow-lg mb-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
          <span className="text-primary-foreground font-bold text-lg">📝</span>
        </div>
        <h2 className="font-bold text-xl text-foreground">My Todo App</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <DarkModeToggle />
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.phone}</div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

    