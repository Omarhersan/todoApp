'use client'

import { useEffect, useState } from "react";
import TodoItem from "./todoItem";
import NewTodoForm from "./todoForm";
import type { Todo } from "@/types/todo";

export default function Todo() {
  const [todosData, setTodos] = useState<Todo[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/todos');
      const data = await res.json();
      setTodos(data.data);
    }
    fetchData();
  }, []);

  function removeTodo(id: number) {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }

  function updateTodo(updatedTodo: Todo) {
    setTodos(prev =>
      prev.map(todo => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
  }

  function addTodo(newTodo: Todo) {
    setTodos(prev => [...prev, newTodo]);
    setShowNewForm(false);
  }

  return (
    <div className="flex flex-col gap-6">
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
