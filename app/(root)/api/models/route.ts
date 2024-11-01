// app/(root)/api/models/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const response = await fetch("http://localhost:11434/api/tags");
  const data = await response.json();
  // console.log("Models:", data);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  await fetch("http://localhost:11434/api/pull", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return NextResponse.json({ message: "Model downloaded" });
}

export async function DELETE(request: NextRequest) {
  const { name } = await request.json();
  await fetch("http://localhost:11434/api/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return NextResponse.json({ message: "Model removed" });
}
