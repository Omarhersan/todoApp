'use client'

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import dynamic from "next/dynamic";
import type { Todo } from "@/types/todo";

// Dynamically import heavy components with loading states
const TodoItem = dynamic(() => import("./todoItem"), {
  loading: () => (
    <div className="animate-pulse bg-card/20 h-16 rounded-lg border border-border/20"></div>
  ),
  ssr: false
});

const NewTodoForm = dynamic(() => import("./todoForm"), {
  loading: () => (
    <div className="animate-pulse bg-card/20 h-32 rounded-lg border border-border/20"></div>
  ),
});

const EnhancementStats = dynamic(() => import("./enhancementStats"), {
  loading: () => (
    <div className="animate-pulse bg-card/20 h-24 rounded-lg border border-border/20"></div>
  ),
});

export default function Todo() {
  const [todosData, setTodos] = useState<Todo[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [enhancingTodos, setEnhancingTodos] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  // Memoize expensive computations
  const pendingTodos = useMemo(() => 
    todosData.filter(todo => todo.enhancement_status === "pending"),
    [todosData]
  );

  // Memoized fetch function
  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch('/api/todos');
      if (res.ok) {
        const data = await res.json();
        setTodos(data.data);
      } else {
        console.error('Failed to fetch todos:', await res.text());
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user, fetchTodos]);

  // Optimized removal function
  const removeTodo = useCallback((id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    setEnhancingTodos(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Optimized update function
  const updateTodo = useCallback((updatedTodo: Todo) => {
    setTodos(prev =>
      prev.map(todo => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
  }, []);

  // Optimized add function
  const addTodo = useCallback((newTodo: Todo) => {
    setTodos(prev => [...prev, newTodo]);
    setShowNewForm(false);
    
    // If the new todo is pending, add it to enhancing set
    if (newTodo.enhancement_status === "pending") {
      setEnhancingTodos(prev => new Set(prev).add(newTodo.id));
    }
  }, []);

  const checkEnhancementStatus = useCallback(async (todoId: number) => {
    try {
      const res = await fetch(`/api/todos/status?id=${todoId}`);
      if (res.ok) {
        const { data } = await res.json();
        if (data.enhancement_status !== "pending") {
          // Enhancement is complete, update the todo
          setTodos(prevTodos => 
            prevTodos.map(todo => 
              todo.id === todoId 
                ? {
                    ...todo,
                    enhanced_title: data.enhanced_title,
                    steps: data.steps,
                    enhancement_status: data.enhancement_status
                  }
                : todo
            )
          );
          
          // Remove from enhancing set
          setEnhancingTodos(prev => {
            const newSet = new Set(prev);
            newSet.delete(todoId);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error('Error checking enhancement status:', error);
    }
  }, []);

  // Optimized polling with exponential backoff
  useEffect(() => {
    if (pendingTodos.length === 0) return;

    let pollInterval = 2000; // Start with 2 seconds
    const maxInterval = 10000; // Max 10 seconds
    
    const poll = () => {
      const currentPendingTodos = todosData.filter(todo => 
        todo.enhancement_status === "pending"
      );
      
      if (currentPendingTodos.length === 0) return;

      // Check all pending todos
      currentPendingTodos.forEach(todo => {
        checkEnhancementStatus(todo.id);
      });

      // Increase interval gradually to reduce server load
      pollInterval = Math.min(pollInterval * 1.2, maxInterval);
    };

    poll(); // Initial check
    const interval = setInterval(poll, pollInterval);

    return () => clearInterval(interval);
  }, [pendingTodos.length, checkEnhancementStatus, todosData]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Enhancement Statistics */}
      {todosData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <EnhancementStats todos={todosData} />
        </div>
      )}
      
      {/* Enhancement Status Banner */}
      {enhancingTodos.size > 0 && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-5 h-5 bg-primary rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-5 h-5 bg-primary rounded-full animate-ping opacity-20"></div>
            </div>
            <span className="text-primary font-medium">
              {enhancingTodos.size === 1 
                ? "✨ 1 task is being enhanced by AI..." 
                : `✨ ${enhancingTodos.size} tasks are being enhanced by AI...`}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-2 ml-8">
            Enhanced tasks will show improved titles and actionable steps automatically.
          </p>
        </div>
      )}

      {/* Add Task Button / Inline Form */}
      <div>
        {!showNewForm ? (
          <button
            className="group relative overflow-hidden px-6 py-3 bg-primary text-primary-foreground rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            onClick={() => setShowNewForm(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 transition-opacity opacity-0 group-hover:opacity-100"></div>
            <span className="relative flex items-center gap-2">
              <span className="text-lg">+</span>
              Add New Task
            </span>
          </button>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <NewTodoForm 
              onAdd={addTodo} 
              onCancel={() => setShowNewForm(false)} 
            />
          </div>
        )}
      </div>

      {/* Todo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {todosData.map(todo => (
          <div key={todo.id} className="transform transition-all duration-300 hover:scale-105">
            <TodoItem
              todo={todo}
              onDeleteLocal={removeTodo}
              onUpdateLocal={updateTodo}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {todosData.length === 0 && !showNewForm && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No tasks yet</h3>
          <p className="text-muted-foreground mb-6">Start by adding your first task to get organized!</p>
          <button
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            onClick={() => setShowNewForm(true)}
          >
            + Add Your First Task
          </button>
        </div>
      )}
    </div>
  );
}
