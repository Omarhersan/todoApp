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
  const [description, setDescription] = useState(todo.description || '');
  const [steps, setSteps] = useState(todo.steps || []);
  const [saving, setSaving] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [justEnhanced, setJustEnhanced] = useState(false);

  // Use enhanced title if available, otherwise use original title
  const displayTitle = todo.enhanced_title || todo.title;
  const isEnhanced = !!todo.enhanced_title;
  const isProcessing = todo.enhancement_status === "pending";
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
    setDescription(todo.description || '');
    setSteps(todo.steps || []);
    setExpanded(false);
  }

  

  return (
    <div className={`group relative overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-md shadow-sm hover:shadow-lg transition-all duration-300 ${
      justEnhanced ? 'ring-2 ring-primary/50 bg-primary/5 scale-[1.02] shadow-lg' : ''
    } ${checked ? 'opacity-75' : ''}`}>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <CheckButton checked={checked} onToggle={toggleTodo} />
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <p className={`font-semibold text-lg leading-tight ${
                  checked ? "line-through text-muted-foreground" : "text-foreground"
                }`}>
                  {displayTitle}
                </p>
                {isProcessing && (
                  <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full flex items-center gap-2 whitespace-nowrap">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    Enhancing...
                  </span>
                )}
                {isEnhanced && !isProcessing && (
                  <span className="text-xs bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                    ✨ Enhanced
                  </span>
                )}
                {hasFailed && (
                  <span className="text-xs bg-destructive/20 text-destructive px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                    ⚠️ Failed
                  </span>
                )}
              </div>
              
              {todo.description && (
                <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{todo.description}</p>
              )}
              
              {todo.steps && todo.steps.length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowSteps(!showSteps)}
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-2 font-medium transition-colors"
                  >
                    <span className={`transform transition-transform ${showSteps ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    {todo.steps.length} Step{todo.steps.length > 1 ? 's' : ''}
                  </button>
                  {showSteps && (
                    <ul className="mt-3 ml-6 space-y-2">
                      {todo.steps.map((step, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0 mt-2"></span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <ActionsMenu 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          </div>
        </div>

        {expanded && (
          <div className="mt-6 pt-6 border-t border-border/50 space-y-4 bg-muted/20 -mx-6 -mb-6 p-6 rounded-b-xl">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Original Title</label>
              <input
                className="w-full border border-border rounded-lg p-3 bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Original title"
              />
            </div>
            
            {todo.enhanced_title && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Enhanced Title</label>
                <input
                  className="w-full border border-border rounded-lg p-3 bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={enhancedTitle}
                  onChange={(e) => setEnhancedTitle(e.target.value)}
                  placeholder="Enhanced title"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                className="w-full border border-border rounded-lg p-3 bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={3}
              />
            </div>
            
            {todo.steps && todo.steps.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Steps</label>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <span className="text-sm text-muted-foreground font-medium mt-3 flex-shrink-0 w-6">
                        {index + 1}.
                      </span>
                      <input
                        className="flex-1 border border-border rounded-lg p-3 bg-background/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
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
                        className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-lg transition-all flex-shrink-0"
                        title="Remove step"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 6l12 12M6 18L18 6"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setSteps([...steps, ''])}
                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2 p-2 hover:bg-primary/10 rounded-lg transition-all"
                  >
                    <span className="text-lg">+</span> Add Step
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 border border-border bg-background/50 text-foreground rounded-lg font-medium hover:bg-muted/50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );


}
