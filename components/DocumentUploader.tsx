// components/DocumentUploader.tsx

"use client";

import { useState, FormEvent } from "react";

import { saveVector, deleteAllVectors } from "@/hooks/useIndexedDB";

export default function DocumentUploader() {
  const [documentText, setDocumentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [embeddings, setEmbeddings] = useState<number[] | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

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
        console.log(
          "data embed's:",
          data.embeddings.embeddings[0],
          "text:",
          documentText
        );
        setEmbeddings(data.embeddings.embeddings[0]);
        await saveVector(data.embeddings.embeddings[0], {
          content: documentText,
        });
        console.log(
          "Embeddings saved in IndexedDB:",
          data.embeddings.embeddings[0]
        );
        setMessage("Document embedded and stored successfully!");
      } else {
        throw new Error(data.error || "Failed to generate embeddings");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error uploading document.");
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
        <button
          onClick={() => deleteAllVectors()}
          className={`mt-4 w-full rounded-md bg-indigo-600 p-3 text-white hover:bg-indigo-700`}
        >
          Refresh Embeddings
        </button>
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
        {embeddings && (
          <div className="mt-4">
            <h2 className="mb-2 text-center text-xl font-bold text-gray-700">
              Embeddings:
            </h2>
            <pre className="h-48 overflow-x-auto rounded bg-gray-100 p-4 text-gray-700">
              {JSON.stringify(embeddings, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
