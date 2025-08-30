import { createClient } from "@/lib/supabase/server";

// Helper function to get user_id from request headers
function getUserIdFromHeaders(request: Request): string | null {
  const userIdHeader = request.headers.get("x-user-id");
  return userIdHeader;
}

export async function GET(request: Request) {
  const userId = getUserIdFromHeaders(request);

  if (!userId) {
    return Response.json({ 
      error: "x-user-id header is required for external API calls" 
    }, { status: 400 });
  }

  const supaClient = await createClient();

  const { data, error } = await supaClient
    .from("todos")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    status: 200,
    data: data
  });
}

export async function POST(request: Request) {
  const userId = getUserIdFromHeaders(request);

  if (!userId) {
    return Response.json({ 
      error: "x-user-id header is required for external API calls" 
    }, { status: 400 });
  }

  const supaClient = await createClient();

  const { title, description } = await request.json();

  if (!title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const { data, error } = await supaClient
    .from("todos")
    .insert({
      title,
      description: description || null,
      is_completed: false,
      created_at: new Date().toISOString(),
      completed_at: null,
      user_id: parseInt(userId),
      enhancement_status: "pending",
      source: "external_api"
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ status: 201, data });
}
