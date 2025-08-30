import { createClient } from "@/lib/supabase/server";

// Helper function to get user phone from request headers and fetch user_id
async function getUserIdFromPhone(request: Request): Promise<{ userId: number; error?: string }> {
  const phoneHeader = request.headers.get("x-user-phone");
  
  if (!phoneHeader) {
    return { userId: 0, error: "x-user-phone header is required for external API calls" };
  }

  const supaClient = await createClient();
  
  const { data: user, error } = await supaClient
    .from("users")
    .select("id")
    .eq("phone", phoneHeader.trim())
    .single();

  if (error || !user) {
    return { userId: 0, error: `User not found with phone number: ${phoneHeader}` };
  }

  return { userId: user.id };
}

export async function GET(request: Request) {
  const { userId, error } = await getUserIdFromPhone(request);

  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  const supaClient = await createClient();

  const { data, error: dbError } = await supaClient
    .from("todos")
    .select("*")
    .eq("user_id", userId);

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 });
  }

  return Response.json({
    status: 200,
    data: data
  });
}

export async function POST(request: Request) {
  const { userId, error } = await getUserIdFromPhone(request);

  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  const supaClient = await createClient();

  const { title, description } = await request.json();

  if (!title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const { data, error: dbError } = await supaClient
    .from("todos")
    .insert({
      title,
      description: description || null,
      is_completed: false,
      created_at: new Date().toISOString(),
      completed_at: null,
      user_id: userId,
      enhancement_status: "pending",
      source: "external_api"
    })
    .select()
    .single();

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 });
  }

  return Response.json({ status: 201, data });
}
