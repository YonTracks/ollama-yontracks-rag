// components/SettingsMenu.tsx

"use client";

import Link from "next/link";
import { Tool } from "ollama";
import { useState, useEffect, useRef, useCallback } from "react";
import { FaEllipsisV, FaChevronDown } from "react-icons/fa";

import config from "@/ollama.config.json";

interface SettingsMenuProps {
  model: string;
  onModelSelectAction: (selectedModel: string) => void;
}

export default function SettingsMenu({
  model,
  onModelSelectAction,
}: SettingsMenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "models" | "tools">(
    "models"
  );
  const [position, setPosition] = useState({ x: -220, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [configData, setConfigData] = useState(config);

  // Track selected tools
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Fetch the configuration data from the API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setConfigData(data);
        setSelectedTools(data.defaultTools.map((tool: Tool) => tool.function));
      } catch (error) {
        console.error("Error fetching config:", error);
        alert("Failed to fetch configuration.");
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const toolsEnabled = selectedTools.length > 0;
    setConfigData((prev) => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        toolsEnabled,
      },
    }));
  }, [selectedTools]);

  const handleToolCheckboxChange = (toolName: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolName)
        ? prev.filter((name) => name !== toolName)
        : [...prev, toolName]
    );
  };

  const handleSettingsUpdate = async () => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configData),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      alert("Settings updated successfully!");
      setDropdownOpen(false);
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings. Please try again.");
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, e.clientX - dragStartPosition.current.x);
        const newY = Math.max(0, e.clientY - dragStartPosition.current.y);
        setPosition({ x: newX, y: newY });
      }
    },
    [isDragging]
  );

  const handleModelSelect = (selectedModel: string) => {
    setConfigData({
      ...configData,
      globalSettings: {
        ...configData.globalSettings,
        defaultModel: selectedModel,
      },
    });
    onModelSelectAction(selectedModel);
    setDropdownOpen(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPosition.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, isDragging]);

  return (
    <div className="relative">
      <button
        className="flex items-center rounded-full p-2 shadow-sm hover:bg-gray-200 focus:outline-none"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {model ? <span>{model}</span> : <FaEllipsisV />}
        <FaChevronDown className="ml-2" />
      </button>

      {dropdownOpen && (
        <div
          className="absolute z-50 mt-2 w-64 resize rounded-md border border-gray-200 bg-white shadow-lg"
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
            resize: "both",
            overflow: "auto",
          }}
        >
          <div
            className="flex cursor-move items-center justify-between bg-gray-100 p-2"
            onMouseDown={handleMouseDown}
          >
            <span className="font-semibold text-gray-700">Menu</span>
            <button
              onClick={() => setDropdownOpen(false)}
              className="px-2 text-black hover:text-gray-400"
            >
              X
            </button>
          </div>

          <div className="flex justify-around border-b border-gray-200">
            <button
              className={`w-1/3 py-2 ${
                activeTab === "settings"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
            <button
              className={`w-1/3 py-2 ${
                activeTab === "models"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveTab("models")}
            >
              Models
            </button>
            <button
              className={`w-1/3 py-2 ${
                activeTab === "tools"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveTab("tools")}
            >
              Tools
            </button>
          </div>

          <div className="p-4">
            {activeTab === "settings" && (
              <div>
                <label className="block text-gray-700">
                  API Endpoint:
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2"
                    value={configData.globalSettings.apiBase}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        globalSettings: {
                          ...configData.globalSettings,
                          apiBase: e.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label className="block text-gray-700">
                  Default Model:
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2"
                    value={configData.globalSettings.defaultModel}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        globalSettings: {
                          ...configData.globalSettings,
                          defaultModel: e.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label className="mt-4 flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    checked={configData.globalSettings.ipythonEnabled}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        globalSettings: {
                          ...configData.globalSettings,
                          ipythonEnabled: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                  Enable IPython
                </label>
                <button
                  className="mt-4 rounded-md bg-blue-500 px-3 py-2 font-semibold text-white hover:bg-blue-600 focus:outline-none"
                  onClick={handleSettingsUpdate}
                >
                  Save Settings
                </button>
              </div>
            )}

            {activeTab === "models" && (
              <div>
                {configData.models.map((modelConfig, index) => (
                  <button
                    key={index}
                    className={`w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 ${
                      modelConfig.model === model ? "bg-gray-200" : ""
                    }`}
                    onClick={() => handleModelSelect(modelConfig.model)}
                  >
                    {modelConfig.name}
                  </button>
                ))}
                <Link href={"/models"}>
                  <button className="mt-4 rounded-md bg-blue-500 px-3 py-2 font-semibold text-white hover:bg-blue-600 focus:outline-none">
                    Add Model
                  </button>
                </Link>
              </div>
            )}

            {activeTab === "tools" && (
              <div>
                {configData.defaultTools.length > 0 ? (
                  configData.defaultTools.map((tool, index) => (
                    <div key={index} className="mb-4 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTools.includes(tool.function)}
                        onChange={() => handleToolCheckboxChange(tool.function)}
                        className="mr-2 "
                      />
                      <label className="text-gray-700">{tool.function}</label>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700">No tools configured.</p>
                )}
                <Link href={"/tools"}>
                  <button className="mt-4 rounded-md bg-blue-500 px-3 py-2 font-semibold text-white hover:bg-blue-600 focus:outline-none">
                    Add Tool
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
