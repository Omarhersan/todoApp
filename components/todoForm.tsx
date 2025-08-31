'use client'

import { useState } from "react";
import type { Todo } from "@/types/todo";

export default function NewTodoForm({
  onAdd,
  onCancel, // <-- optional cancel callback
}: {
  onAdd: (newTodo: Todo) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function handleAdd() {
    if (!title.trim()) return;

    setAdding(true);
    setSuccessMessage("");
    
    try {
      const res = await fetch("/api/todos", { // call top-level POST route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          is_completed: false,
          created_at: new Date().toISOString(),
          completed_at: null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      const { data } = await res.json();
      onAdd(data); // add to parent list
      setTitle("");
      setDescription("");
      
      // Show success message based on enhancement status
      if (data.enhancement_status === "processing") {
        setSuccessMessage("Task created! AI is enhancing it now... ✨");
      } else if (data.enhancement_status === "done") {
        setSuccessMessage("Task created and enhanced! ✨");
      } else {
        setSuccessMessage("Task created successfully!");
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      console.error("Failed to add todo", e);
    } finally {
      setAdding(false);
    }
  }

  function handleCancel() {
    setTitle("");
    setDescription("");
    if (onCancel) onCancel();
  }

  return (
    <div className="mb-4 flex flex-col gap-2 border rounded-lg p-4 bg-card/70 backdrop-blur-md shadow-md">
      {successMessage && (
        <div className="mb-2 p-2 bg-green-50 border border-green-200 text-green-800 rounded text-sm">
          {successMessage}
        </div>
      )}
      <input
        className="border rounded p-2 bg-background text-foreground"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task title"
      />
      <textarea
        className="border rounded p-2 bg-background text-foreground"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="New task description"
      />
      <div className="flex gap-2 mt-2">
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
          onClick={handleAdd}
          disabled={adding}
        >
          {adding ? "Adding..." : "Add Task"}
        </button>
        <button
          className="px-4 py-2 border rounded"
          onClick={handleCancel}
          disabled={adding}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
