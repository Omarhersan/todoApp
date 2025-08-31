import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers";
import OpenAI from 'openai';

export async function GET(){
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("user_id");

    if (!userIdCookie) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supaClient = await createClient();

    const { data, error } = await supaClient
        .from("todos")
        .select("*")
        .eq("user_id", userIdCookie.value);

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
        "status": 200,
        "data": data
    })
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get("user_id");

  if (!userIdCookie) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supaClient = await createClient();

  const { title, description } = await req.json();

  const { data, error } = await supaClient
    .from("todos")
    .insert({
      title,
      description,
      is_completed: false,
      created_at: new Date().toISOString(),
      completed_at: null,
      user_id: parseInt(userIdCookie.value),
      enhancement_status: "pending",
      source: "app"
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Trigger auto-enhancement immediately (no setTimeout needed)
  processAutoEnhancement(data.id, data.title);

  return Response.json({ status: 201, data });
}

// Auto-enhancement function that runs immediately
async function processAutoEnhancement(todoId: number, title: string) {
  try {
    const supaClient = await createClient();
    
    // Generate enhanced content using OpenAI
    const { enhancedTitle, steps } = await enhanceWithOpenAI(title);

    // Update the todo with enhanced content
    const { error } = await supaClient
      .from("todos")
      .update({
        enhanced_title: enhancedTitle,
        enhancement_status: "done",
        steps: steps,
      })
      .eq("id", todoId);

    if (error) {
      console.error("Enhancement failed:", error);
      // Set enhancement status to failed
      await supaClient
        .from("todos")
        .update({ enhancement_status: "failed" })
        .eq("id", todoId);
    }
  } catch (error) {
    console.error("Auto-enhancement error:", error);
    
    // Set enhancement status to failed on any error
    try {
      const supaClient = await createClient();
      await supaClient
        .from("todos")
        .update({ enhancement_status: "failed" })
        .eq("id", todoId);
    } catch (updateError) {
      console.error("Failed to update enhancement status to failed:", updateError);
    }
  }
}

// OpenAI enhancement function
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

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that enhances todo tasks. Given a todo title, you should:
1. Create an enhanced, more descriptive and actionable version of the title
2. Generate 3-5 specific, actionable steps to complete the task

Respond in JSON format with:
{
  "enhancedTitle": "Enhanced version of the title",
  "steps": ["Step 1", "Step 2", "Step 3", ...]
}

Keep the enhanced title concise but more descriptive. Make steps specific and actionable.`
        },
        {
          role: "user",
          content: `Enhance this todo task: "${title}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content;
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

// Fallback enhancement functions (used when OpenAI is not available)
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