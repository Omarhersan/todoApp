import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supaClient = await createClient();
  const { name, phone } = await req.json();

  if (!name || !phone) {
    return Response.json({ error: "Name and phone are required" }, { status: 400 });
  }

  // Simple phone validation
  if (!/^\d+$/.test(phone)) {
    return Response.json({ error: "Phone must contain only numbers" }, { status: 400 });
  }

  try {
    // Check if user with this phone already exists
    const { data: existingUser } = await supaClient
      .from("users")
      .select("id")
      .eq("phone", phone)
      .single();

    if (existingUser) {
      return Response.json({ error: "User with this phone number already exists" }, { status: 400 });
    }

    // Create new user
    const { data: newUser, error } = await supaClient
      .from("users")
      .insert({
        name: name.trim(),
        phone: phone.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return Response.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("user_id", newUser.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return Response.json({ 
      status: 201, 
      data: { 
        user: {
          id: newUser.id,
          name: newUser.name,
          phone: newUser.phone
        }
      } 
    });
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
