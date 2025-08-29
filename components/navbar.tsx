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
    <nav className="w-full flex justify-between items-center p-4 bg-card/80 backdrop-blur-md rounded-xl shadow-md ">
      <h2 className="font-bold text-lg">My Todo App</h2>
      <div className="flex items-center gap-4">
        <DarkModeToggle />
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.name} ({user.phone})
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

    