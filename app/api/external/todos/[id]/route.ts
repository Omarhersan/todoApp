import { createClient } from "@/lib/supabase/server";

// Helper function to get user_id from request headers
function getUserIdFromHeaders(request: Request): string | null {
  const userIdHeader = request.headers.get("x-user-id");
  return userIdHeader;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromHeaders(request);

  if (!userId) {
    return Response.json({ 
      error: "x-user-id header is required for external API calls" 
    }, { status: 400 });
  }

  const supaClient = await createClient();
  const { id } = await params;

  const { data, error } = await supaClient
    .from("todos")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return Response.json({ error: "Todo not found" }, { status: 404 });
  }

  return Response.json({
    status: 200,
    data: data
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromHeaders(request);

  if (!userId) {
    return Response.json({ 
      error: "x-user-id header is required for external API calls" 
    }, { status: 400 });
  }

  const supaClient = await createClient();
  const { id } = await params;
  
  const updateData = await request.json();
  
  // Validate that user can only update their own todos
  const { data: existingTodo } = await supaClient
    .from("todos")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!existingTodo) {
    return Response.json({ error: "Todo not found or access denied" }, { status: 404 });
  }

  // Handle completion status
  if (updateData.is_completed !== undefined) {
    updateData.completed_at = updateData.is_completed 
      ? new Date().toISOString() 
      : null;
  }

  const { data, error } = await supaClient
    .from("todos")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    status: 200,
    data: data
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromHeaders(request);

  if (!userId) {
    return Response.json({ 
      error: "x-user-id header is required for external API calls" 
    }, { status: 400 });
  }

  const supaClient = await createClient();
  const { id } = await params;

  // Validate that user can only delete their own todos
  const { data: existingTodo } = await supaClient
    .from("todos")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!existingTodo) {
    return Response.json({ error: "Todo not found or access denied" }, { status: 404 });
  }

  const { error } = await supaClient
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    status: 200,
    message: "Todo deleted successfully",
    id: id
  });
}
