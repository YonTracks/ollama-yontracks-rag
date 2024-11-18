"use client";

import { useState, FormEvent } from "react";

export default function DetokenizerComponent() {
  const [tokenInput, setTokenInput] = useState("");
  const [detokenizedText, setDetokenizedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const tokens = tokenInput
        .split(",")
        .map((t) => t.trim())
        .map((t) => parseInt(t, 10));

      if (tokens.some(isNaN)) {
        throw new Error(
          "Invalid tokens. Please ensure all tokens are integers."
        );
      }

      const response = await fetch("/api/detokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2",
          tokens,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setDetokenizedText(data.text);
        setMessage("Detokenization successful!");
      } else {
        throw new Error(data.error || "Failed to detokenize tokens");
      }
    } catch (error) {
      setMessage("Error during detokenization.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-700">
          Detokenizer
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Enter tokens (comma-separated)"
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
            {loading ? "Detokenizing..." : "Detokenize Tokens"}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
        {detokenizedText && (
          <div className="mt-4">
            <h2 className="mb-2 text-center text-xl font-bold text-gray-700">
              Detokenized Text:
            </h2>
            <pre className="h-48 overflow-x-auto rounded bg-gray-100 p-4 text-gray-700 ">
              {detokenizedText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
