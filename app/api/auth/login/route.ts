import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supaClient = await createClient();
  const { phone } = await req.json();

  if (!phone) {
    return Response.json({ error: "Phone number is required" }, { status: 400 });
  }

  // Simple phone validation
  if (!/^\d+$/.test(phone)) {
    return Response.json({ error: "Phone must contain only numbers" }, { status: 400 });
  }

  try {
    // Find user by phone
    const { data: user, error } = await supaClient
      .from("users")
      .select("*")
      .eq("phone", phone.trim())
      .single();

    if (error || !user) {
      return Response.json({ error: "User not found with this phone number" }, { status: 404 });
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("user_id", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

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
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
