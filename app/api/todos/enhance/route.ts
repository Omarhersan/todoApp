// app/api/todos/enhance/route.ts
import { createClient } from "@/lib/supabase/server";
import OpenAI from 'openai';

export function GET() {
  return new Response("Hello from the GET handler");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Handle both manual enhancement (with provided data) and auto-enhancement (with just taskId)
    const { taskId, enhancedTitle, steps, title } = body;

    if (!taskId) {
      return new Response(JSON.stringify({ error: "Task ID is required" }), { status: 400 });
    }

    const supabase = await createClient();

    let finalEnhancedTitle = enhancedTitle;
    let finalSteps = steps;

    // If enhanced content not provided, generate it using AI
    if (!enhancedTitle || !steps) {
      if (!title) {
        // Fetch the original title from the database
        const { data: todo, error: fetchError } = await supabase
          .from("todos")
          .select("title")
          .eq("id", taskId)
          .single();

        if (fetchError || !todo) {
          return new Response(JSON.stringify({ error: "Todo not found" }), { status: 404 });
        }

        const enhanced = await enhanceWithOpenAI(todo.title);
        finalEnhancedTitle = enhanced.enhancedTitle;
        finalSteps = enhanced.steps;
      } else {
        const enhanced = await enhanceWithOpenAI(title);
        finalEnhancedTitle = enhanced.enhancedTitle;
        finalSteps = enhanced.steps;
      }
    }

    const { data, error } = await supabase
      .from("todos")
      .update({
        enhanced_title: finalEnhancedTitle,
        enhancement_status: "done",
        steps: finalSteps || [],
      })
      .eq("id", taskId)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // Return the updated todo data for immediate frontend update
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err: unknown) {
    console.error("Enhancement error:", err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}

// OpenAI enhancement function (same as in route.ts)
async function enhanceWithOpenAI(title: string): Promise<{ enhancedTitle: string; steps: string[] }> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OpenAI API key not found, using fallback enhancement");
    return {
      enhancedTitle: enhanceTitleFallback(title),
      steps: generateStepsFallback(title)
    };
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const result = await openai.responses.create({
      model: "gpt-5",
      input: `You are a helpful assistant that enhances todo tasks. Given this todo title: "${title}"

Please:
1. Create an enhanced, more descriptive and actionable version of the title
2. Generate 3-5 specific, actionable steps to complete the task

Respond in JSON format with:
{
  "enhancedTitle": "Enhanced version of the title",
  "steps": ["Step 1", "Step 2", "Step 3", ...]
}

Keep the enhanced title concise but more descriptive. Make steps specific and actionable.`,
      reasoning: { effort: "medium" },
      text: { verbosity: "low" },
    });

    const response = result.output_text;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(response);
    
    if (!parsed.enhancedTitle || !parsed.steps || !Array.isArray(parsed.steps)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      enhancedTitle: parsed.enhancedTitle,
      steps: parsed.steps
    };
  } catch (error) {
    console.error("OpenAI enhancement failed:", error);
    // Fall back to simple enhancement
    return {
      enhancedTitle: enhanceTitleFallback(title),
      steps: generateStepsFallback(title)
    };
  }
}

// Fallback enhancement functions
function enhanceTitleFallback(title: string): string {
  const enhanced = title.charAt(0).toUpperCase() + title.slice(1);
  if (!enhanced.endsWith('.') && !enhanced.endsWith('!') && !enhanced.endsWith('?')) {
    return enhanced + ' ✨';
  }
  return enhanced.replace(/[.!?]$/, ' ✨');
}

function generateStepsFallback(title: string): string[] {
  const words = title.toLowerCase().split(' ');
  const steps = [
    `Plan and prepare for: ${title}`,
    `Execute the main task: ${title}`,
    `Review and finalize: ${title}`
  ];
  
  // Add specific steps based on keywords
  if (words.some(word => ['buy', 'purchase', 'get', 'order'].includes(word))) {
    steps.unshift('Research options and compare prices');
    steps.push('Complete the purchase');
  } else if (words.some(word => ['clean', 'organize', 'tidy'].includes(word))) {
    steps.unshift('Gather necessary cleaning supplies');
    steps.push('Put everything back in place');
  } else if (words.some(word => ['write', 'create', 'draft', 'compose'].includes(word))) {
    steps.unshift('Research and gather information');
    steps.push('Review and edit the final result');
  } else if (words.some(word => ['call', 'contact', 'phone'].includes(word))) {
    steps.unshift('Prepare talking points');
    steps.push('Follow up if needed');
  } else if (words.some(word => ['exercise', 'workout', 'gym'].includes(word))) {
    steps.unshift('Warm up properly');
    steps.push('Cool down and stretch');
  }
  
  return steps;
}
