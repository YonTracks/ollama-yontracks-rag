// app/(root)/api/create/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if both 'name' and 'modelfile' exist in the request body
    const { name, modelfile } = body;
    if (!name || !modelfile) {
      return NextResponse.json(
        { error: "'name' and 'modelfile' are required fields" },
        { status: 400 }
      );
    }

    // Attempt to send the POST request to the backend API
    const response = await fetch("http://localhost:11434/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, modelfile }),
    });
    console.log("resonse:", response);
    // Check if the fetch request was successful
    if (!response.ok) {
      const errorDetails = await response.text(); // Get any error messages from the response
      return NextResponse.json(
        { error: `Failed to create model: ${errorDetails}` },
        { status: response.status }
      );
    }
    console.log("resonse:", response);
    // If successful, return a success message
    return NextResponse.json({ message: "Model created successfully" });
  } catch (error) {
    // Handle any unexpected errors that might occur during the process
    return NextResponse.json(
      { error: `An error occurred: ${error}` },
      { status: 500 }
    );
  }
}
