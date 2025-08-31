"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import components for better code splitting
const Navbar = dynamic(() => import("@/components/navbar"), {
  loading: () => (
    <div className="animate-pulse bg-card/20 h-16 rounded-lg border border-border/20 mb-8"></div>
  ),
  ssr: false
});

const Todo = dynamic(() => import("@/components/todo"), {
  loading: () => (
    <div className="animate-pulse bg-card/20 min-h-96 rounded-lg border border-border/20"></div>
  ),
  ssr: false
});

// Loading component for better UX
function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    </main>
  );
}

// Welcome section component to reduce main component size
function WelcomeSection({ userName }: { userName: string }) {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        Welcome back, {userName}!
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Stay organized and productive with your AI-enhanced todo list
      </p>
    </div>
  );
}

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navbar */}
        <Suspense fallback={<div className="animate-pulse bg-card/20 h-16 rounded-lg border border-border/20 mb-8"></div>}>
          <Navbar />
        </Suspense>

        {/* Welcome Section */}
        <WelcomeSection userName={user.name} />

        {/* Todo Container */}
        <div className="relative">
          {/* Subtle background decoration */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl opacity-20 blur-xl"></div>
          
          {/* Main content */}
          <div className="relative bg-card/40 backdrop-blur-xl border border-border/30 rounded-3xl shadow-2xl overflow-hidden">
            <Suspense fallback={<div className="animate-pulse bg-card/20 min-h-96 rounded-lg border border-border/20 p-6"></div>}>
              <Todo />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
