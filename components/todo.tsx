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

  // Poll for enhancement status of processing todos
  useEffect(() => {
    const processingTodos = todosData.filter(todo => 
      todo.enhancement_status === "processing"
    );

    if (processingTodos.length === 0) return;

    const interval = setInterval(() => {
      processingTodos.forEach(todo => {
        checkEnhancementStatus(todo.id);
      });
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [todosData]);

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

  async function checkEnhancementStatus(todoId: number) {
    try {
      const res = await fetch(`/api/todos/status?id=${todoId}`);
      if (res.ok) {
        const { data } = await res.json();
        if (data.enhancement_status !== "processing") {
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
    
    // If the new todo is processing, add it to enhancing set
    if (newTodo.enhancement_status === "processing") {
      setEnhancingTodos(prev => new Set(prev).add(newTodo.id));
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Enhancement Statistics */}
      {todosData.length > 0 && <EnhancementStats todos={todosData} />}
      
      {/* Enhancement Status Banner */}
      {enhancingTodos.size > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-800 text-sm font-medium">
              {enhancingTodos.size === 1 
                ? "1 task is being enhanced by AI..." 
                : `${enhancingTodos.size} tasks are being enhanced by AI...`}
            </span>
          </div>
          <p className="text-blue-700 text-xs mt-1">
            Enhanced tasks will show improved titles and actionable steps automatically.
          </p>
        </div>
      )}

      {/* Add Task Button / Inline Form */}
      <div>
        {!showNewForm ? (
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded shadow hover:shadow-lg transition"
            onClick={() => setShowNewForm(true)}
          >
            + Add New Task
          </button>
        ) : (
          <NewTodoForm 
            onAdd={addTodo} 
            onCancel={() => setShowNewForm(false)} 
          />
        )}
      </div>

      {/* Todo Grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {todosData.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onDeleteLocal={removeTodo}
            onUpdateLocal={updateTodo}
          />
        ))}
      </ul>
    </div>
  );
}
