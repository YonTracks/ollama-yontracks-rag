// app/(root)/rag/page.tsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

import DetokenizerComponent from "@/components/DetokenizerComponent";
import DocumentUploader from "@/components/DocumentUploader";
import TokenizerComponent from "@/components/TokenizerComponent";
import { getSimilarVectors } from "@/hooks/useIndexedDB";

export default function RAGPage() {
  const [query, setQuery] = useState("");
  const [similarDocuments, setSimilarDocuments] = useState<unknown>([]);
  const [isTokenizerDropdownOpen, setIsTokenizerDropdownOpen] = useState(false);

  const fetchSimilarDocuments = async () => {
    if (!query.trim()) {
      alert("Please enter a query.");
      return;
    }

    try {
      // Vectorize the query (e.g., via tokenization or embedding API)
      const response = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "nomic-embed-text",
          prompt: query,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const queryVector = data.embeddings.embeddings[0]; // Use tokens as the vector
        console.log("Query vector:", queryVector);

        // Fetch similar documents based on the vector
        const results = await getSimilarVectors(queryVector, 0.5);
        console.log("Similar documents:", results);
        setSimilarDocuments(results);
      } else {
        throw new Error(data.error || "Failed to tokenize the query");
      }
    } catch (error) {
      console.error("Error fetching similar documents:", error);
      alert("An error occurred while fetching similar documents.");
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold">Test RAG System</h1>
      <p className="max-w-xl">
        This is a simple Retrieval-Augmented Generation (RAG) experimental
        system. It uses IndexedDB to store text embeddings along with their
        metadata. You can upload documents, generate embeddings, and search for
        similar content based on vector similarity. This demonstrates local
        vector storage and similarity-based retrieval directly in the browser.
      </p>
      <button
        onClick={() => setIsTokenizerDropdownOpen(!isTokenizerDropdownOpen)}
        className="mt-4 flex w-full max-w-md items-center justify-center rounded-full bg-blue-500 p-3 font-semibold text-white hover:bg-blue-600"
        title="Toggle the list of available tools"
      >
        {isTokenizerDropdownOpen ? (
          <>
            Hide Tokenizer <FaChevronUp className="ml-2" />
          </>
        ) : (
          <>
            Show Tokenizer <FaChevronDown className="ml-2" />
          </>
        )}
      </button>

      {isTokenizerDropdownOpen && (
        <>
          <div className="flex max-w-xl">
            <p className="text-red-600">NOTICE! </p>

            <Link
              className="max-w-xl px-2 text-blue-600 hover:text-blue-500"
              href={`https://github.com/YonTracks/ollama-yontracks/blob/main/docs/api.md#tokenizer`}
            >
              TOKENIZER
            </Link>
            <br />
            <p>Ollama custom build used for tokenizer.</p>
          </div>
          <div className="sm:flex">
            <TokenizerComponent />
            <DetokenizerComponent />
          </div>
        </>
      )}
      {/* Document Uploader */}
      <DocumentUploader />

      {/* Query Input and Search */}
      <div className="mt-4 w-full max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchSimilarDocuments}
          className="mt-2 w-full rounded bg-blue-500 p-3 text-white hover:bg-blue-600"
        >
          Fetch Similar Documents
        </button>
      </div>

      {/* Display Results */}
      {similarDocuments.length > 0 && (
        <div className="mt-6 w-full max-w-2xl rounded p-4 shadow-md">
          <h2 className="mb-2 text-lg font-bold">Similar Documents:</h2>
          <ul className="space-y-2">
            {similarDocuments.map((doc, index) => (
              <li
                key={index}
                className="rounded border border-gray-200 p-3 shadow-sm"
              >
                <p>
                  <strong>Similarity:</strong> {doc.similarity.toFixed(2)}
                </p>
                <p>
                  <strong>Content:</strong> {doc.metadata.content}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
