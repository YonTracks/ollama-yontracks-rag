// app/(root)/api/currentModel/route.ts

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Ensure the route is always dynamic

export async function GET() {
  try {
    const response = await fetch("http://localhost:11434/api/ps", {
      cache: "no-store", // Disable caching for this fetch request
    });
    const data = await response.json();
    // console.log("API Response Data:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching current model:", error);
    return NextResponse.json({ models: [] }, { status: 500 });
  }
}
