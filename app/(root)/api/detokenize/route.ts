// app/(root)/api/detokenize/route.ts
// detokenize endpoint for ollama

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Ensure the route is always dynamic

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.model || !Array.isArray(body.tokens)) {
      return NextResponse.json(
        { error: "Missing required fields: 'model' and 'tokens' are required" },
        { status: 400 }
      );
    }

    console.log("Detokenize request body:", body);

    // Forward the request to the Ollama detokenize API
    const result = await fetch("http://localhost:11434/api/detokenize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.error("Error from Ollama detokenize API:", errorText);
      return NextResponse.json({ error: errorText }, { status: result.status });
    }

    const response = await result.json();
    console.log("Detokenize response:", response);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/detokenize:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
