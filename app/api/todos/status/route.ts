import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get("user_id");

  if (!userIdCookie) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const todoId = url.searchParams.get('id');

  if (!todoId) {
    return Response.json({ error: "Todo ID is required" }, { status: 400 });
  }

  const supaClient = await createClient();

  const { data, error } = await supaClient
    .from("todos")
    .select("id, title, enhanced_title, steps, enhancement_status")
    .eq("id", todoId)
    .eq("user_id", userIdCookie.value)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return Response.json({ error: "Todo not found" }, { status: 404 });
  }

  return Response.json({
    status: 200,
    data: {
      id: data.id,
      title: data.title,
      enhanced_title: data.enhanced_title,
      steps: data.steps,
      enhancement_status: data.enhancement_status
    }
  });
}
