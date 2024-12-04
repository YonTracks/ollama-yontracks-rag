// app/api/searchVector/route.ts
import { NextRequest, NextResponse } from "next/server";

import { searchByVector, createVector, tokenizeText } from "@/lib/indexedDB";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const tokens = tokenizeText(text);
  const inputVector = createVector(tokens);

  const results = await searchByVector(inputVector);
  return NextResponse.json({ results });
}
