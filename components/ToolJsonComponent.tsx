"use client";

import React, { useState, useCallback } from "react";

const ToolJsonComponent: React.FC = () => {
  const [newToolParameters, setNewToolParameters] = useState(`  {
    "type": "function",
    "function": {
      "name": "get_flight_times",
      "description": "Get the flight times between two cities",
      "parameters": {
        "type": "object",
        "properties": {
          "departure": {
            "type": "string",
            "description": "The departure city (airport code)"
          },
          "arrival": {
            "type": "string",
            "description": "The arrival city (airport code)"
          }
        },
        "required": [
          "departure",
          "arrival"
        ]
      }
    }
  }`);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTool = useCallback(async () => {
    setError(null);

    if (!newToolParameters.trim()) {
      setError("Tool parameters (JSON) are required.");
      return;
    }

    let parsedParameters;
    try {
      parsedParameters = JSON.parse(newToolParameters);
    } catch (err) {
      setError("Invalid JSON for parameters. Please ensure it is valid JSON.");
      return;
    }

    try {
      const response = await fetch("/api/tool-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedParameters),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setError(error || "Failed to add tool");
        return;
      }

      // Reset fields after successful creation
      setNewToolParameters("");
      alert("Tool added successfully!");

      // Optionally, refetch tools to update UI
      // This depends on how you load tools in ToolsPage.
    } catch (creationError: any) {
      setError(
        creationError?.message || "An error occurred while creating the tool."
      );
    }
  }, [newToolParameters]);

  return (
    <div className="mt-6 w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-gray-700">Create Tool JSON</h2>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <div className="space-y-4">
        <textarea
          value={newToolParameters}
          onChange={(e) => setNewToolParameters(e.target.value)}
          placeholder="Tool Parameters (JSON schema)"
          className="w-full rounded border border-gray-300 p-3 shadow-sm"
          rows={5}
          title="Enter the tool parameters in JSON format"
        />
        <button
          className="w-full rounded bg-green-500 p-3 font-semibold text-white hover:bg-green-600"
          title="Create the new tool"
          onClick={handleCreateTool}
        >
          Create Tool JSON
        </button>
      </div>
    </div>
  );
};

export default ToolJsonComponent;
