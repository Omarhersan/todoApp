'use client'
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import React, { use, useEffect, useState } from 'react';

type Todo = { id: number,
     title: string ,
     created_at: Timestamp,
     isCompleted: boolean,
     completedAt: Timestamp,
    description: string,
}
                    

async function getTodos(): Promise<Todo[]> {
    const response = await fetch('/api/todos');
    if (!response.ok) {
        throw new Error('Failed to fetch todos');
    }
    const res = await response.json();

    return res.data;
}

export default function Todo(){
    const [todosData, setTodos] = useState<Todo[]>([]);
    useEffect(() => {
        async function fetchData() {
            const todos = await getTodos();
            setTodos(todos);
        }
        fetchData();
    }, []);


    return (
        <div>
            <h1>Todo List</h1>
            <ul>
                {todosData.map(todo => (
                    <li key={todo.id}>{todo.title}</li>
                ))}
            </ul>
        </div>
    );
}
