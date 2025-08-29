import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: Request, ctx: { params: { id: string } }) {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("user_id");

    if (!userIdCookie) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supaClient = await createClient();

    const { id } = ctx.params;
    const { data, error } = await supaClient
        .from("todos")
        .select("*")
        .eq("id", id)
        .eq("user_id", userIdCookie.value)
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
        "status": 200,
        "data": data
    })
}

export async function DELETE(req: Request) {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("user_id");

    if (!userIdCookie) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supaClient = await createClient();

    const { id } = await req.json();
    const response = await supaClient.from('todos').delete().eq('id', id).eq('user_id', userIdCookie.value);

    if (response.error) {
        return Response.json({ error: response.error.message }, { status: 500 });
    }

    return Response.json({
        "status": 200,
        "id": id
    })
}

export async function PUT(req: Request) {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("user_id");

    if (!userIdCookie) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supaClient = await createClient();

    const data = await req.json();
    const response = await supaClient.from('todos').update(data).eq('id', data.id).eq('user_id', userIdCookie.value);

    if (response.error) {
        return Response.json({ error: response.error.message }, { status: 500 });
    }

    return Response.json({
        "status": 200,
        "data": data
    })
}
