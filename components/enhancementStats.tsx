'use client'

import type { Todo } from "@/types/todo";

interface EnhancementStatsProps {
  todos: Todo[];
}

export default function EnhancementStats({ todos }: EnhancementStatsProps) {
  const totalTodos = todos.length;
  const enhancedTodos = todos.filter(todo => todo.enhanced_title).length;
  const processingTodos = todos.filter(todo => todo.enhancement_status === "pending").length;
  const failedTodos = todos.filter(todo => todo.enhancement_status === "failed").length;

  if (totalTodos === 0) return null;

  const enhancementRate = Math.round((enhancedTodos / totalTodos) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/10 border border-border/30 backdrop-blur-sm">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-transparent"></div>
      
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="text-2xl">✨</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Enhancement Overview</h3>
            <p className="text-sm text-muted-foreground">AI-powered task optimization</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-card/50 border border-border/30">
            <div className="text-2xl font-bold text-primary mb-1">{totalTodos}</div>
            <div className="text-sm text-muted-foreground font-medium">Total Tasks</div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-card/50 border border-border/30">
            <div className="text-2xl font-bold text-secondary-foreground mb-1">{enhancedTodos}</div>
            <div className="text-sm text-muted-foreground font-medium">Enhanced</div>
          </div>
          
          {processingTodos > 0 && (
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border/30">
              <div className="text-2xl font-bold text-primary flex items-center justify-center gap-2 mb-1">
                {processingTodos}
                <div className="relative">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-primary rounded-full animate-ping opacity-20"></div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Processing</div>
            </div>
          )}
          
          <div className="text-center p-4 rounded-xl bg-card/50 border border-border/30">
            <div className="text-2xl font-bold text-accent-foreground mb-1">{enhancementRate}%</div>
            <div className="text-sm text-muted-foreground font-medium">Enhanced Rate</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Enhancement Progress</span>
            <span>{enhancedTodos}/{totalTodos}</span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-1000"
              style={{ width: `${enhancementRate}%` }}
            ></div>
          </div>
        </div>

        {failedTodos > 0 && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="text-sm text-destructive font-medium flex items-center gap-2">
              <span>⚠️</span>
              {failedTodos} task{failedTodos === 1 ? '' : 's'} failed to enhance
            </div>
          </div>
        )}
        
        {enhancedTodos > 0 && (
          <div className="mt-4 p-3 bg-secondary/20 border border-secondary/30 rounded-lg">
            <div className="text-sm text-secondary-foreground flex items-center gap-2">
              <span>💡</span>
              Enhanced tasks include AI-generated titles and actionable steps
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
