'use client'

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import TodoItem from "./todoItem";
import NewTodoForm from "./todoForm";
import EnhancementStats from "./enhancementStats";
import type { Todo } from "@/types/todo";

export default function Todo() {
  const [todosData, setTodos] = useState<Todo[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [enhancingTodos, setEnhancingTodos] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  async function fetchTodos() {
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
  }

  function removeTodo(id: number) {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    setEnhancingTodos(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }

  function updateTodo(updatedTodo: Todo) {
    setTodos(prev =>
      prev.map(todo => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
  }

  function addTodo(newTodo: Todo) {
    setTodos(prev => [...prev, newTodo]);
    setShowNewForm(false);
    
    // If the new todo is pending, add it to enhancing set
    if (newTodo.enhancement_status === "pending") {
      setEnhancingTodos(prev => new Set(prev).add(newTodo.id));
    }
  }

  const checkEnhancementStatus = useCallback(async (todoId: number) => {
    try {
      const res = await fetch(`/api/todos/status?id=${todoId}`);
      if (res.ok) {
        const { data } = await res.json();
        if (data.enhancement_status !== "pending") {
          // Enhancement is complete, update the todo
          updateTodo({
            ...todosData.find(t => t.id === todoId)!,
            enhanced_title: data.enhanced_title,
            steps: data.steps,
            enhancement_status: data.enhancement_status
          });
          
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
  }, [todosData]);

  // Poll for enhancement status of processing todos
  useEffect(() => {
    const processingTodos = todosData.filter(todo => 
      todo.enhancement_status === "pending"
    );

    if (processingTodos.length === 0) return;

    const interval = setInterval(() => {
      processingTodos.forEach(todo => {
        checkEnhancementStatus(todo.id);
      });
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [todosData, checkEnhancementStatus]);

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
