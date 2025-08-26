import { createClient } from "@/lib/supabase/server";

const supaClient = await createClient();



export async function GET(req: Request, ctx: RouteContext<'/api/todo/[id]'>) {
    const { id } = await ctx.params;
    const { data, error } = await supaClient
        .from("todos")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
        "data": data
    })
}

export async function POST(req: Request) {
    const data = await req.json();
    const response = await supaClient.from('todos').insert(data);

    if (response.error) {
        return Response.json({ error: response.error.message }, { status: 500 });
    }

    return Response.json({
        "message": "Todo created successfully!",
        "data": data
    })
}

export async function DELETE(req: Request) {
    const { id } = await req.json();
    const response = await supaClient.from('todos').delete().eq('id', id);

    if (response.error) {
        return Response.json({ error: response.error.message }, { status: 500 });
    }

    return Response.json({
        "message": "Todo deleted successfully!",
        "id": id
    })
}

export async function PUT(req: Request) {
    const data = await req.json();
    const response = await supaClient.from('todos').update(data).eq('id', data.id);

    if (response.error) {
        return Response.json({ error: response.error.message }, { status: 500 });
    }

    return Response.json({
        "message": "Todo updated successfully!",
        "data": data
    })
}
