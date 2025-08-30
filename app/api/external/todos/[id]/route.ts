import { createClient } from "@/lib/supabase/server";

// Helper function to get user phone from request headers and fetch user_id
async function getUserIdFromPhone(request: Request): Promise<{ userId: number; error?: string }> {
  let phoneHeader = request.headers.get("x-user-phone");
  phoneHeader = phoneHeader?.slice(4) || '';

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await getUserIdFromPhone(request);

  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  const supaClient = await createClient();
  const { id } = await params;

  const { data, error: dbError } = await supaClient
    .from("todos")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 });
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
  const { userId, error } = await getUserIdFromPhone(request);

  if (error) {
    return Response.json({ error }, { status: 400 });
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

  const { data, error: dbError } = await supaClient
    .from("todos")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 });
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
  const { userId, error } = await getUserIdFromPhone(request);

  if (error) {
    return Response.json({ error }, { status: 400 });
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

  const { error: dbError } = await supaClient
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 });
  }

  return Response.json({
    status: 200,
    message: "Todo deleted successfully",
    id: id
  });
}
