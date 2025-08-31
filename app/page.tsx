"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Todo from "@/components/todo";
import { Box } from "@/components/ui/box";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navbar */}
        <Navbar />

        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay organized and productive with your AI-enhanced todo list
          </p>
        </div>

        {/* Todo Container */}
        <div className="relative">
          {/* Subtle background decoration */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl opacity-20 blur-xl"></div>
          
          {/* Main content */}
          <div className="relative bg-card/40 backdrop-blur-xl border border-border/30 rounded-3xl shadow-2xl overflow-hidden">
            <Todo />
          </div>
        </div>
      </div>
    </main>
  );
}
