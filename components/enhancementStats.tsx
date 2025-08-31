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
    <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">✨ Enhancement Overview</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{totalTodos}</div>
          <div className="text-gray-600">Total Tasks</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{enhancedTodos}</div>
          <div className="text-gray-600">Enhanced</div>
        </div>
        
        {processingTodos > 0 && (
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600 flex items-center justify-center gap-1">
              {processingTodos}
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-gray-600">Processing</div>
          </div>
        )}
        
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{enhancementRate}%</div>
          <div className="text-gray-600">Enhanced Rate</div>
        </div>
      </div>

      {failedTodos > 0 && (
        <div className="mt-2 text-xs text-red-600">
          ⚠️ {failedTodos} task{failedTodos === 1 ? '' : 's'} failed to enhance
        </div>
      )}
      
      {enhancedTodos > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          Enhanced tasks include AI-generated titles and actionable steps
        </div>
      )}
    </div>
  );
}
