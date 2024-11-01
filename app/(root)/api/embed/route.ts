// app/(root)/api/embed/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { model, prompt } = await request.json();
    const result = await fetch("http://localhost:11434/api/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, input: prompt }),
    });

    if (!result.ok) {
      const errorResponse = await result.text();
      return new NextResponse(
        JSON.stringify({ error: `External API Error: ${errorResponse}` }),
        { status: result.status }
      );
    }

    const embeddings = await result.json();
    return NextResponse.json({ embeddings });
  } catch (error) {
    console.error("Server error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
