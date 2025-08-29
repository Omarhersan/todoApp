import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers";

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

  return Response.json({ status: 201, data });
}