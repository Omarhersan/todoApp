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
      if (data.enhancement_status === "pending") {
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
    <div className="space-y-4">
      {successMessage && (
        <div className="p-4 bg-secondary/30 border border-secondary/50 text-secondary-foreground rounded-xl text-sm font-medium flex items-center gap-2">
          <span className="text-lg">✨</span>
          {successMessage}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Task Title</label>
          <input
            className="w-full border border-border rounded-lg p-4 bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAdd()}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description (optional)</label>
          <textarea
            className="w-full border border-border rounded-lg p-4 bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any additional details..."
            rows={3}
          />
        </div>
      </div>
      
      <div className="flex gap-3 pt-2">
        <button
          className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md focus:ring-2 focus:ring-primary/20"
          onClick={handleAdd}
          disabled={adding || !title.trim()}
        >
          {adding ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
              Creating Task...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg">+</span>
              Add Task
            </span>
          )}
        </button>
        <button
          className="px-6 py-4 border border-border bg-background/50 text-foreground rounded-lg font-medium hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-border"
          onClick={handleCancel}
          disabled={adding}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
