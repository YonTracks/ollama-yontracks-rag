"use client";

import { useState } from "react";
// import { v4 as uuidv4 } from "uuid";

import DetokenizerComponent from "@/components/DetokenizerComponent";
import DocumentUploader from "@/components/DocumentUploader";
import TokenizerComponent from "@/components/TokenizerComponent";

export default function RAGPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!prompt) return;
    // const requestId = uuidv4(); // Generate a unique request ID
    setLoading(true);
    setResponse("");

    try {
      // Query vector database to retrieve similar embeddings
      const searchResponse = await fetch("/api/ragSearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });

      const { context } = await searchResponse.json();

      // Send retrieved context to the Ollama API
      /*
      const ollamaResponse = await fetch("/api/ollama", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "request-id": requestId, // Add requestId to headers
        },
        body: JSON.stringify({
          model: "llama3.1",
          prompt,
          context,
          stream: true,
        }),
      });

      const result = await ollamaResponse.json();
      */

      // For demonstration purposes, let's assume we get a response directly from the RAG system
      const result = {
        response: `This is a simulated response based on the context retrieved: ${context}`,
      };
      setResponse(result.response || "No response from model.");
    } catch (error) {
      console.error("Error querying RAG system:", error);
      setResponse("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold">RAG System</h1>
      <DocumentUploader />
      <div className="sm:flex ">
        <TokenizerComponent />
        <DetokenizerComponent />
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your query"
        rows={4}
        className="w-full max-w-md rounded-md border p-2"
      />
      <button
        onClick={handleQuery}
        disabled={loading}
        className={`mt-4 rounded-md px-4 py-2 text-white ${
          loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "Fetching..." : "Query"}
      </button>
      <div className="mt-4 w-full max-w-md rounded-md p-4">{response}</div>
    </div>
  );
}
