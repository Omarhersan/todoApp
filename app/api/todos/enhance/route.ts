// app/api/tasks/enhance/route.ts
import { createClient } from "@/lib/supabase/server";

export function GET(req: Request) {
  return new Response("Hello from the GET handler");
}

export async function POST(req: Request) {
  try {
    const { taskId, enhancedTitle, steps } = await req.json();

    if (!taskId || !enhancedTitle) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("todos")
      .update({
        enhanced_title: enhancedTitle,
        enhancement_status: "done",
        steps: steps || [],
      })
      .eq("id", taskId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
