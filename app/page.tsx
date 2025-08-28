import Navbar from "@/components/navbar";
import Todo from "@/components/todo";
import { Box } from "@/components/ui/box";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background text-foreground p-4">
      {/* Navbar */}
      <Navbar />

      {/* Page Title */}
      <h1 className="text-3xl font-bold mt-6 mb-6">My Todo App</h1>

      {/* Todo Container */}
      <Box className="w-full max-w-5xl p-6 bg-card/70 backdrop-blur-md rounded-xl shadow-lg">
        
        {/* Add Task Button & Form handled by Todo component */}
        <Todo />
      </Box>
    </main>
  );
}
