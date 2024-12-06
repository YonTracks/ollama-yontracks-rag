// app/(root)/tools/page.tsx

"use client";

import { Tool } from "ollama";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaTrashAlt,
  FaSearch,
} from "react-icons/fa";

import ToolFunctionComponent from "@/components/ToolFunctionComponent";
import ToolJsonComponent from "@/components/ToolJsonComponent";
import { tools } from "@/lib/tools/toolsConfig";
import config from "@/ollama.config.json";

function ToolsPage() {
  const [configData, setConfigData] = useState(config);
  const [toolsList, setToolsList] = useState<Tool[]>(tools);

  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch the configuration data from the API
  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch configuration");
      const data = await response.json();
      setConfigData(data);
      setToolsList(tools);
    } catch (error) {
      console.error("Error fetching config:", error);
      alert("Failed to fetch configuration.");
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Add a new tool
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
  // Remove an existing tool
  const removeTool = async (tool: Tool) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove the tool "${tool.function.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      // Remove the model from the local config data
      const updatedConfigData = {
        ...configData,
        defaultTools: configData.defaultTools.filter(
          (toolConfig) => toolConfig.function.name !== tool.function.name
        ),
      };

      // Update the config file with the modified model list
      const configResponse = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfigData),
      });
      if (!configResponse.ok) throw new Error("Failed to update config file");

      setConfigData(updatedConfigData);

      alert(`${tool.function.name} removed successfully!`);
    } catch (error) {
      console.error("Error removing model:", error);
    }
  };

  // Placeholder for editing a tool
  const editTool = async (tool: Tool) => {
    // Implement edit functionality (e.g., open a modal with tool details)
    alert(
      `Edit functionality for ${tool.function.name} is not implemented yet.`
    );
  };

  // Filter tools based on the search query
  const filteredTools = useMemo(() => {
    return toolsList.filter((tool) =>
      tool.function.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, toolsList]);

  const isToolInConfig = (toolName: string) => {
    return configData.defaultTools.some(
      (toolConfig) => toolConfig.function.name === toolName
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
        <div>
          <ToolJsonComponent />
          <ToolFunctionComponent />
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
          {/* Search Bar */}
          <div className="m-2 flex w-full max-w-3xl items-center space-x-2 rounded-full bg-gray-100 p-3 shadow-md">
            <FaSearch className="text-gray-500" />
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
                title={`Manage options for the tool: ${tool.function.name}`}
              >
                <div className="flex h-full flex-col justify-between">
                  <span className="mb-2 text-lg font-semibold text-gray-800">
                    {tool.function.name}
                  </span>
                  <p className="mb-4 text-sm text-gray-600">
                    {tool.function.description}
                  </p>
                  <div className="mt-auto flex justify-between">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        editTool(tool);
                      }}
                      className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                      title="Edit this tool's details"
                    >
                      <FaEdit size={18} />
                    </button>
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
                        title="Add tool"
                      >
                        Add
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeTool(tool);
                      }}
                      className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                      title="Delete this tool"
                    >
                      <FaTrashAlt size={18} />
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
