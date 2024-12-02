"use client";

import { Tool } from "ollama";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaChevronDown, FaChevronUp, FaEdit } from "react-icons/fa";

import { tools } from "@/lib/tools/toolsJson";
import config from "@/ollama.config.json";

function ToolsPage() {
  const [configData, setConfigData] = useState(config);
  const [newToolName, setNewToolName] = useState("");
  const [newToolDescription, setNewToolDescription] = useState("");
  const [newToolParameters, setNewToolParameters] = useState("");

  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch configuration");
      const data = await response.json();
      setConfigData(data);
    } catch (error) {
      console.error("Error fetching config:", error);
      alert("Failed to fetch configuration.");
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);
  console.log(configData);

  const addTool = async (tool: Tool) => {
    const updatedConfigData = {
      ...configData,
      defaultTools: [...configData.defaultTools, tool],
    };

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfigData),
      });
      if (!response.ok) throw new Error("Failed to update settings");

      setConfigData(updatedConfigData);
      alert(`${tool.function.name} added successfully!`);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const filteredTools = useMemo(() => {
    return tools.filter((tool) =>
      tool.function.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const isToolInConfig = (toolName: string) => {
    return configData.defaultTools.some(
      (tool) => tool.function.name === toolName
    );
  };

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col items-center p-4">
      <h1 className="mb-4 text-3xl font-semibold">Tools</h1>

      {/* Create Tool Section */}
      <button
        onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
        className="mt-4 flex w-full max-w-3xl items-center justify-center rounded-full bg-blue-500 p-3 font-semibold text-white hover:bg-blue-600"
        title="Create a new tool"
      >
        {isCreateDropdownOpen ? (
          <>
            Hide <FaChevronUp className="ml-2" />
          </>
        ) : (
          <>
            Create Tool
            <FaChevronDown className="ml-2" />
          </>
        )}
      </button>

      {isCreateDropdownOpen && (
        <div className="mt-6 w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-700">
            Create New Tool
          </h2>
          <div className="space-y-4">
            <input
              value={newToolName}
              onChange={(e) => setNewToolName(e.target.value)}
              placeholder="Tool Name"
              className="w-full rounded border border-gray-300 p-3 shadow-sm"
              title="Enter the tool name"
            />
            <textarea
              value={newToolDescription}
              onChange={(e) => setNewToolDescription(e.target.value)}
              placeholder="Tool Description"
              className="w-full rounded border border-gray-300 p-3 shadow-sm"
              rows={2}
              title="Enter the tool description"
            />
            <textarea
              value={newToolParameters}
              onChange={(e) => setNewToolParameters(e.target.value)}
              placeholder='Tool Parameters (JSON format, e.g., {"key": "value"})'
              className="w-full rounded border border-gray-300 p-3 shadow-sm"
              rows={3}
              title="Enter the tool parameters in JSON format"
            />
            <button
              className="w-full rounded bg-green-500 p-3 font-semibold text-white hover:bg-green-600"
              title="Create the new tool"
            >
              Create Tool
            </button>
          </div>
        </div>
      )}

      {/* Tools List and Actions */}
      <button
        onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
        className="mt-4 flex w-full max-w-3xl items-center justify-center rounded-full bg-blue-500 p-3 font-semibold text-white hover:bg-blue-600"
        title="Toggle the list of available tools"
      >
        {isToolsDropdownOpen ? (
          <>
            Hide Tools <FaChevronUp className="ml-2" />
          </>
        ) : (
          <>
            Show Tools <FaChevronDown className="ml-2" />
          </>
        )}
      </button>

      {isToolsDropdownOpen && (
        <>
          <div className="m-2 flex w-full max-w-3xl items-center space-x-2 rounded-full bg-gray-100 p-3 shadow-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full rounded border border-gray-300 bg-white p-2 text-black shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
              title="Search tools by name or description"
            />
          </div>
          <ul className="mt-6 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <li
                key={tool.function.name}
                className="rounded-lg bg-gray-100 p-4 shadow-md transition hover:bg-gray-200"
                title={`Manage options for the model: ${tool.function.name}`}
              >
                <div className="flex h-full flex-col justify-between">
                  <span className="mb-4 text-lg font-semibold text-gray-800">
                    {tool.function.name}
                  </span>
                  <div className="mt-auto flex justify-between">
                    {isToolInConfig(tool.function.name) ? (
                      <span
                        className="font-semibold text-green-500"
                        title="This model is already added"
                      >
                        Added
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addTool(tool);
                        }}
                        className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                        title="Add downloaded model"
                      >
                        Add
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // Implement edit functionality if needed
                      }}
                      className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                      title="Edit this model's details"
                    >
                      <FaEdit size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default ToolsPage;
