import { createClient } from "@/lib/supabase/server"


export async function GET(req: Request){
    const supaClient = await createClient();

    const { data, error } = await supaClient
        .from("todos")
        .select("*");

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
        "status": 200,
        "data": data
    })
}

export async function POST(req: Request) {
  const supaClient = await createClient();

  const { title, description } = await req.json();

  // Get the logged-in user
  const {
    data: { user },
  } = await supaClient.auth.getUser();

  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supaClient
    .from("todos")
    .insert({
      title,
      description,
      is_completed: false,
      created_at: new Date().toISOString(),
      completed_at: null,
      user_id: user.id, // RLS requires this
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ status: 201, data });
}