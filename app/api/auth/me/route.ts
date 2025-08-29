import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("user_id");

    if (!userIdCookie) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supaClient = await createClient();
    const { data: user, error } = await supaClient
      .from("users")
      .select("*")
      .eq("id", userIdCookie.value)
      .single();

    if (error || !user) {
      // Clear invalid cookie
      cookieStore.delete("user_id");
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ 
      status: 200, 
      data: { 
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone
        }
      } 
    });
  } catch (error) {
    console.error("Get user error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
