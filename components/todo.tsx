'use client'

import { useEffect, useState } from "react";
import TodoItem from "./todoItem";
import NewTodoForm from "./todoForm";

// Define Todo type here
export type Todo = {
  id: number;
  title: string;
  created_at: string;
  is_completed: boolean;
  completed_at: string | null;
  description: string;
};

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
    setShowNewForm(false); // collapse after adding
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Todo List</h1>

      {/* Collapsible Add Task Button */}
      <div className="mb-4">
        {!showNewForm ? (
          <button
            className="px-3 py-1 bg-green-500 text-white rounded"
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

      <ul className="space-y-2">
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
