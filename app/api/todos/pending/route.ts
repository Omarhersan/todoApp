import { createClient } from "@/lib/supabase/server";

// app/api/tasks/pending/route.ts
export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("todos")
    .select("id,title,user_id,description")
    .eq("enhancement_status", "pending");

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}
