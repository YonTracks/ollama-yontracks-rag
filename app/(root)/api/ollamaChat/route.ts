// app/(root)/api/ollamaChat/route.ts

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Always dynamic for real-time usage

export async function POST(request: NextRequest) {
  try {
    console.log("Received request at /api/ollamaChat");

    const body = await request.json();
    const {
      model,
      messages,
      temperature,
      tools = [],
      options = {},
      stream = false,
    } = body;

    if (!model || !messages || !Array.isArray(messages)) {
      console.error("Validation error: Invalid input.");
      return NextResponse.json(
        { error: "Invalid input: 'model' and 'messages' are required." },
        { status: 400 }
      );
    }

    const payload = {
      model,
      messages,
      ...(stream !== undefined && { stream }),
      ...(temperature !== undefined && { temperature }),
      ...(tools.length > 0 && { tools }),
      ...(options && { options }),
    };

    console.log("Forwarding payload to local chat API:", payload);

    const apiResponse = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Error from local chat API:", errorText);
      return NextResponse.json(
        { error: errorText },
        { status: apiResponse.status }
      );
    }

    if (!apiResponse.body) {
      console.error("Local chat API response body is null.");
      throw new Error("Response body is null");
    }

    console.log("Streaming response to the client...");
    return new NextResponse(apiResponse.body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Server error at /api/ollamaChat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
