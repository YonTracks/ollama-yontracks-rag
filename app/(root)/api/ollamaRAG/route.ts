// app/(root)/api/embed/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ChromaClient } from "chromadb";
import config from "@/ollama.config.json";

export async function POST(request: NextRequest) {
  try {
    const { model, prompt, documents } = await request.json();

    // Initialize ChromaDB client and connect to your collection
    const chroma = new ChromaClient({
      path: config.globalSettings.chromaDir,
    });

    const collection = await chroma.getOrCreateCollection({
      name: config.globalSettings.chromaName,
    });

    // Add documents to ChromaDB
    try {
      const ids = documents.map(
        (_: string, i: string) => `doc_${Date.now()}_${i}`
      );
      await collection.add({
        ids,
        documents,
      });
    } catch (error) {
      console.error("ChromaDB embedding error:", error);
      return NextResponse.json(
        { message: "Error embedding documents in ChromaDB" },
        { status: 500 }
      );
    }

    // Make an external API request to get embeddings for the prompt
    try {
      const result = await fetch("http://localhost:11434/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, input: prompt }),
      });

      if (!result.ok) {
        const errorResponse = await result.text();
        return NextResponse.json(
          { error: `External API Error: ${errorResponse}` },
          { status: result.status }
        );
      }

      const embeddings = await result.json();
      return NextResponse.json({
        message: "Documents embedded successfully",
        embeddings,
      });
    } catch (error) {
      console.error("External API error:", error);
      return NextResponse.json(
        { message: "Error fetching embeddings from external API" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
