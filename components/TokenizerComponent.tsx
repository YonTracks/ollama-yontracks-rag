// components/TokenizerComponent.tsx

"use client";

import { useState, FormEvent } from "react";

// import useIndexedDB, { saveVector } from "@/hooks/useIndexedDB";

export default function TokenizerComponent() {
  const [inputText, setInputText] = useState("");
  const [modelNameInput, setModelNameInput] = useState("llama3.1");
  const [tokens, setTokens] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelNameInput,
          text: inputText,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setTokens(data.tokens);
        setMessage(`Model: ${modelNameInput} Tokenization successful!`);

        // Save the tokens as vector in IndexedDB
        // await saveVector(data.tokens, { content: inputText });
        // console.log("Tokens saved in IndexedDB:", data.tokens);
      } else {
        throw new Error(data.error || "Failed to tokenize input");
      }
    } catch (error) {
      setMessage("Error during tokenization.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-700">
          Tokenizer
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to tokenize"
            rows={5}
            className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <textarea
            value={modelNameInput}
            onChange={(e) => setModelNameInput(e.target.value)}
            placeholder="Enter model name"
            rows={1}
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
            {loading ? "Tokenizing..." : "Tokenize Text"}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
        {tokens && (
          <div className="mt-4">
            <h2 className="mb-2 text-center text-xl font-bold text-gray-700">
              Tokens:
            </h2>
            <pre className="h-48 overflow-x-auto rounded bg-gray-100 p-4 text-gray-700">
              {JSON.stringify(tokens, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
