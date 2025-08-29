import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete("user_id");

    return Response.json({ status: 200, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
