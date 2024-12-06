"use client";

import React, { useState, useCallback } from "react";

const ToolFunctionComponent: React.FC = () => {
  const [functionName, setFunctionName] = useState("getFlightTimes1");
  const [newToolFunction, setNewToolFunction] =
    useState(`export const getFlightTimes = async (
  args: { departure: string; arrival: string } | string
): Promise<string> => {
  // ... same function code ...
};`);
  const [error, setError] = useState<string | null>(null);

  const handleCreateToolFunction = useCallback(async () => {
    setError(null);

    if (!functionName.trim()) {
      setError("Function name is required.");
      return;
    }

    if (!newToolFunction.trim()) {
      setError("Tool function code is required.");
      return;
    }

    try {
      const response = await fetch("/api/tool-function", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          functionName: functionName.trim(),
          functionCode: newToolFunction,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to add tool function");
        return;
      }

      // Reset fields after successful creation
      setFunctionName("");
      setNewToolFunction("");
      alert("Tool function added successfully!");
    } catch (creationError: any) {
      setError(
        creationError?.message ||
          "An error occurred while creating the tool function."
      );
    }
  }, [newToolFunction, functionName]);

  return (
    <div className="mt-6 w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-gray-700">
        Create Tool Function
      </h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="space-y-4">
        <input
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value)}
          placeholder="Function Name"
          className="w-full rounded border border-gray-300 p-3 shadow-sm"
          title="Enter the function name"
        />
        <textarea
          value={newToolFunction}
          onChange={(e) => setNewToolFunction(e.target.value)}
          placeholder="Paste your tool function code here"
          className="w-full rounded border border-gray-300 p-3 shadow-sm"
          rows={15}
          title="Enter the tool function code in TypeScript"
        />
        <button
          className="w-full rounded bg-green-500 p-3 font-semibold text-white hover:bg-green-600"
          title="Create the new tool function"
          onClick={handleCreateToolFunction}
        >
          Create Tool Function
        </button>
      </div>
    </div>
  );
};

export default ToolFunctionComponent;
