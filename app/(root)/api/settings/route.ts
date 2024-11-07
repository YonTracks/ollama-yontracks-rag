import fs from "fs";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Ensure the route is always dynamic

const CONFIG_PATH = path.join(process.cwd(), "ollama.config.json");

export async function GET() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, "utf-8");
    const config = JSON.parse(data);
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error reading config file:", error);
    return NextResponse.json(
      { error: "Failed to read config file" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Optional: Validate the body structure here

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ message: "Config updated successfully" });
  } catch (error) {
    console.error("Error writing to config file:", error);
    return NextResponse.json(
      { error: "Failed to update config file" },
      { status: 500 }
    );
  }
}
