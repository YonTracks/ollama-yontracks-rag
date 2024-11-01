// app/(root)/api/ollamaChat/route.ts
// chat endpoint for ollama

import { NextRequest, NextResponse } from "next/server";

// Ensure the route is always dynamic
export const dynamic = "force-dynamic";

// This API route handles chat requests and forwards them to the local chat API
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const {
      model,
      messages,
      tools = [],
      options = {},
      stream = false,
    } = await request.json();

    // Validate required fields
    if (!model || !messages) {
      // Return a 400 Bad Request if required fields are missing
      return NextResponse.json(
        {
          error:
            "Missing required fields: 'model' and 'messages' are required.",
        },
        { status: 400 }
      );
    }

    // Forward the request to the local chat API
    const result = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        tools,
        options,
        stream,
        truncate: false,
      }),
    });

    // Handle non-OK status codes explicitly
    if (!result.ok) {
      const errorText = await result.text();
      // Return the error from the downstream service
      return NextResponse.json({ error: errorText }, { status: result.status });
    }

    // Check if the response body exists
    if (!result.body) throw new Error("Response body is null");

    // Return the response body as the stream
    return new NextResponse(result.body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    // Log the error and return a 500 Internal Server Error
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
