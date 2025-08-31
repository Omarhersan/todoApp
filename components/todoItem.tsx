'use client'

import { useState, useEffect } from "react";
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
  const [enhancedTitle, setEnhancedTitle] = useState(todo.enhanced_title || '');
  const [description, setDescription] = useState(todo.description);
  const [steps, setSteps] = useState(todo.steps || []);
  const [saving, setSaving] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [justEnhanced, setJustEnhanced] = useState(false);

  // Use enhanced title if available, otherwise use original title
  const displayTitle = todo.enhanced_title || todo.title;
  const isEnhanced = !!todo.enhanced_title;
  const isProcessing = todo.enhancement_status === "processing";
  const hasFailed = todo.enhancement_status === "failed";

  // Update local state when todo prop changes (for enhancement updates)
  useEffect(() => {
    const wasProcessing = !todo.enhanced_title;
    setEnhancedTitle(todo.enhanced_title || '');
    setSteps(todo.steps || []);
    
    // Trigger animation when task gets enhanced
    if (wasProcessing && todo.enhanced_title && todo.enhancement_status === "done") {
      setJustEnhanced(true);
      setTimeout(() => setJustEnhanced(false), 2000);
    }
  }, [todo.enhanced_title, todo.steps, todo.enhancement_status]);

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
    const res = await fetch(`/api/todos/handle/${todo.id}`, {
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
      const updateData = {
        id: todo.id,
        title,
        description,
        ...(todo.enhanced_title && { enhanced_title: enhancedTitle }),
        ...(todo.steps && todo.steps.length > 0 && { steps }),
      };

      const res = await fetch(`/api/todos/handle/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      // Update the todo with all the changed fields, preserving other data
      const updatedTodo = { 
        ...todo, 
        title, 
        description,
        ...(todo.enhanced_title && { enhanced_title: enhancedTitle }),
        ...(todo.steps && todo.steps.length > 0 && { steps }),
      };
      onUpdateLocal(updatedTodo);
      setExpanded(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setTitle(todo.title);
    setEnhancedTitle(todo.enhanced_title || '');
    setDescription(todo.description);
    setSteps(todo.steps || []);
    setExpanded(false);
  }

  

  return (
    <li className={`flex flex-col p-4 rounded-lg border bg-card/70 backdrop-blur-md shadow-md mb-2 transition-all duration-300 hover:shadow-lg ${
      justEnhanced ? 'ring-2 ring-green-300 bg-green-50/50 scale-[1.02]' : ''
    }`}>
  <div className="flex items-start justify-between">
    <div className="flex items-start gap-3">
      <CheckButton checked={checked} onToggle={toggleTodo} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <p className={checked ? "line-through text-muted-foreground font-semibold" : "font-semibold text-foreground"}>
            {displayTitle}
          </p>
          {isProcessing && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              Enhancing...
            </span>
          )}
          {isEnhanced && !isProcessing && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
              ✨ Enhanced
            </span>
          )}
          {hasFailed && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center gap-1">
              ⚠️ Enhancement failed
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
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Original Title</label>
        <input
          className="w-full border rounded p-2 bg-background text-foreground"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Original title"
        />
      </div>
      
      {todo.enhanced_title && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Enhanced Title</label>
          <input
            className="w-full border rounded p-2 bg-background text-foreground"
            value={enhancedTitle}
            onChange={(e) => setEnhancedTitle(e.target.value)}
            placeholder="Enhanced title"
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
        <textarea
          className="w-full border rounded p-2 bg-background text-foreground"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
      </div>
      
      {todo.steps && todo.steps.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Steps</label>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  className="flex-1 border rounded p-2 bg-background text-foreground text-sm"
                  value={step}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[index] = e.target.value;
                    setSteps(newSteps);
                  }}
                  placeholder={`Step ${index + 1}`}
                />
                <button
                  onClick={() => {
                    const newSteps = steps.filter((_, i) => i !== index);
                    setSteps(newSteps);
                  }}
                  className="px-2 py-1 text-red-500 hover:text-red-700 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => setSteps([...steps, ''])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Step
            </button>
          </div>
        </div>
      )}
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
