import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { functionName, functionCode } = body;

  // Validate input
  if (!functionName || !functionCode) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Ensure function name is a valid filename
  const sanitizedFunctionName = functionName.replace(/[^a-zA-Z0-9-]/g, "");

  if (!sanitizedFunctionName) {
    return NextResponse.json(
      { error: "Invalid function name" },
      { status: 400 }
    );
  }

  const newFunctionPath = path.join(
    process.cwd(),
    "lib",
    "tools",
    `${sanitizedFunctionName}.ts`
  );

  // Check if the function file already exists
  if (fs.existsSync(newFunctionPath)) {
    return NextResponse.json(
      { error: "Tool function already exists" },
      { status: 400 }
    );
  }

  try {
    fs.writeFileSync(newFunctionPath, functionCode, "utf8");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing function file:", error);
    return NextResponse.json(
      { error: "Failed to write function file" },
      { status: 500 }
    );
  }
}
