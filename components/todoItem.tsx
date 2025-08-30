'use client'

import { useState } from "react";
import CheckButton from "./ui/checkButton";
import ActionsMenu from "./ui/actionsMenu";
import type { Todo } from "@/types/todo";

export default function TodoItem({
  todo,
  onDeleteLocal,
  onUpdateLocal,
}: {
  todo: Todo;
  onDeleteLocal: (id: number) => void;
  onUpdateLocal: (updatedTodo: Todo) => void;
}) {
  const [checked, setChecked] = useState(todo.is_completed);
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [saving, setSaving] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  // Use enhanced title if available, otherwise use original title
  const displayTitle = todo.enhanced_title || todo.title;
  const isEnhanced = !!todo.enhanced_title;

  async function toggleTodo() {
    const res = await fetch(`/api/todos/handle/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: todo.id,
        is_completed: !checked,
        completed_at: !checked ? new Date().toISOString() : null,
      }),
    });

    if (res.ok) {
      setChecked(!checked);
      onUpdateLocal({ ...todo, is_completed: !checked, completed_at: !checked ? new Date().toISOString() : null });
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/todos/handle${todo.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: todo.id }),
    });

    if (res.ok) onDeleteLocal(todo.id);
  }

  function handleEdit() {
    setExpanded(!expanded);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/todos/handle${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: todo.id,
          title,
          description,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      onUpdateLocal({ ...todo, title, description });
      setExpanded(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setTitle(todo.title);
    setDescription(todo.description);
    setExpanded(false);
  }

  

  return (
    <li className="flex flex-col p-4 rounded-lg border bg-card/70 backdrop-blur-md shadow-md mb-2 transition hover:shadow-lg">
  <div className="flex items-start justify-between">
    <div className="flex items-start gap-3">
      <CheckButton checked={checked} onToggle={toggleTodo} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <p className={checked ? "line-through text-muted-foreground font-semibold" : "font-semibold text-foreground"}>
            {displayTitle}
          </p>
          {isEnhanced && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Enhanced
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm mt-1">{todo.description}</p>
        {todo.steps && todo.steps.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {showSteps ? '▼' : '▶'} Steps ({todo.steps.length})
            </button>
            {showSteps && (
              <ul className="mt-1 ml-4 text-sm text-muted-foreground">
                {todo.steps.map((step, index) => (
                  <li key={index} className="list-disc">
                    {step}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
    <ActionsMenu 
      onEdit={handleEdit} 
      onDelete={handleDelete} 
    />
  </div>

  {expanded && (
    <div className="mt-3 space-y-2">
      <input
        className="w-full border rounded p-2 bg-background text-foreground"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border rounded p-2 bg-background text-foreground"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  )}
</li>

  );
}
