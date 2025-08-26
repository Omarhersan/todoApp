import Navbar from "@/components/navbar";
import Todo from "@/components/todo";
import { Box } from "@/components/ui/box";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Navbar />
        <Box>
          <h1 className="text-2xl font-bold">My Todo App</h1>
          <Todo />
        </Box>
        
      </div>
    </main>
  );
}
