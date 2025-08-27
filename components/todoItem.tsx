'use client'

import { useState } from "react";
import CheckButton from "./ui/checkButton";
import ActionsMenu from "./ui/actionsMenu";
import type { Todo } from "./todo";

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

  async function toggleTodo() {
    const res = await fetch(`/api/todos/${todo.id}`, {
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
    const res = await fetch(`/api/todos/${todo.id}`, {
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
      const res = await fetch(`/api/todos/${todo.id}`, {
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
    <li className="flex flex-col border rounded-lg p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckButton checked={checked} onToggle={toggleTodo} />
          <span className={checked ? "line-through text-gray-500" : ""}>
            {todo.title}
          </span>
        </div>
        <ActionsMenu onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      {expanded && (
        <div className="mt-3 space-y-2">
          <input
            className="w-full border rounded p-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full border rounded p-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
