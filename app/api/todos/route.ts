import { createClient } from "@/lib/supabase/server"


export async function GET(req: Request){
    const supaClient = await createClient();

    const { data, error } = await supaClient
        .from("todos")
        .select("*");

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
        "status": 200,
        "data": data
    })
}