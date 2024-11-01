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
      const response = await fetch("/api/ollamaRAG", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documents: [documentText] }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Document uploaded and embedded successfully!");
      } else {
        setMessage(result.message || "Error embedding document");
      }
    } catch (error: unknown) {
      setMessage("Failed to upload document");
      console.log(error);
    } finally {
      setLoading(false);
      setDocumentText("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Upload Document</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder="Enter document content here"
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={true || loading}
            className={`w-full p-3 text-white rounded-md ${
              loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Uploading..." : "Upload Document"}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
