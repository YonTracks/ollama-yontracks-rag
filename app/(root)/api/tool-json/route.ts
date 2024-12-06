import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";

const toolsConfigPath = path.join(
  process.cwd(),
  "lib",
  "tools",
  "toolsConfig.json"
);

export async function POST(request: Request) {
  const toolData = await request.json();

  // Basic validation
  if (!toolData || typeof toolData !== "object") {
    return NextResponse.json({ error: "Invalid tool data" }, { status: 400 });
  }

  // Ensure function and function name exist
  const toolName = toolData?.function?.name;
  if (!toolName) {
    return NextResponse.json(
      { error: "Tool name is required" },
      { status: 400 }
    );
  }

  // Read current tools
  const data = fs.readFileSync(toolsConfigPath, "utf8");
  const tools = JSON.parse(data);

  // Check if tool already exists
  if (tools.some((tool: any) => tool.function?.name === toolName)) {
    return NextResponse.json({ error: "Tool already exists" }, { status: 400 });
  }

  // Add new tool to the array
  tools.push(toolData);

  // Write updated tools back to file
  fs.writeFileSync(toolsConfigPath, JSON.stringify(tools, null, 2), "utf8");

  return NextResponse.json({ success: true });
}
