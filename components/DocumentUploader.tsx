"use client";

import { useState, FormEvent } from "react";

export default function DocumentUploader() {
  const [documentText, setDocumentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "nomic-embed-text",
          prompt: documentText,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(
          `Document embedded and stored successfully! check console for embeddings.  `
        );

        console.log("Embedding:", data.embeddings);
        // TODO: Store embeddings in a vector database (e.g. chroma, Pinecone, Weaviate).
      } else {
        throw new Error(data.error || "Failed to generate embeddings");
      }
    } catch (error) {
      setMessage("Error uploading document.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setDocumentText("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-700">
          EmbedDocument
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder="Enter document content here"
            rows={5}
            className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md p-3 text-white ${
              loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Embedding..." : "Embed your Document"}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
