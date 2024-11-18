// app/(root)/api/ollama/route.ts
// generate endpoint for ollama

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Ensure the route is always dynamic

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("request-id");
  const body = await request.json();

  console.log("Incoming request:", { requestId, body });

  if (!requestId) {
    console.error("Request ID is missing");
    return NextResponse.json(
      { error: "Request ID is missing" },
      { status: 400 }
    );
  }

  try {
    // Validate request body
    if (!body.model || !body.prompt) {
      console.error("Missing required fields:", body);
      return NextResponse.json(
        { error: "Missing required fields: 'model' and 'prompt' are required" },
        { status: 400 }
      );
    }

    // Initialize AbortController for timeout handling
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50000); // 50-second timeout

    // Forward the request to the actual model API
    const result = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout)); // Clean up timeout

    if (!result.ok) {
      const errorText = await result.text();
      console.error("Error from downstream service:", errorText);
      return NextResponse.json({ error: errorText }, { status: result.status });
    }

    const stream = result.body;
    if (!stream) throw new Error("Stream is null");

    return new NextResponse(stream, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "name" in error) {
      if (error.name === "AbortError") {
        console.log(
          `Stream for requestId: ${requestId} was aborted due to timeout \nPlease try restarting ollama, or try again later`
        );
      } else {
        console.error("Connection refused to the model API:", error);
        return NextResponse.json(
          { error: "context[] is not compatible" },
          { status: 503 } // Service Unavailable
        );
      }
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
  return NextResponse.json(
    { error: "Request timed out or was aborted" },
    { status: 408 } // Request Timeout
  );
}
