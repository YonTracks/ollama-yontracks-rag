// app/(root)/api/stop/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { model } = await request.json();

    console.log("Received model to stop:", model);
    if (!model) {
      return NextResponse.json(
        { error: "Model name is required." },
        { status: 400 }
      );
    }

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, stream: false, keep_alive: 0 }),
    });

    const jsonResponse = await response.json();

    // Log the response from the stop endpoint
    console.log("Received response from Ollama /stop endpoint:", jsonResponse);

    if (!response.ok) {
      console.error("Failed to stop the model:", jsonResponse.error);
      return NextResponse.json(
        { error: jsonResponse.error || "Failed to stop the model" },
        { status: response.status }
      );
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error stopping model execution:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
