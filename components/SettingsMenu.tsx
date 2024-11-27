// components/SettingsMenu.tsx

"use client";

import Link from "next/link";
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

  // Fetch the configuration data from the API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        setConfigData(data);
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    };
    fetchConfig();
  }, []);

  // Handle form submission to update settings
  const handleSettingsUpdate = async () => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configData),
      });
      if (!response.ok) {
        throw new Error("Failed to update settings");
      }
      alert("Settings updated successfully!");

      setDropdownOpen(false);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  // Handle model selection
  const handleModelSelect = (selectedModel: string) => {
    // Update configData
    setConfigData({
      ...configData,
      globalSettings: {
        ...configData.globalSettings,
        defaultModel: selectedModel,
      },
    });

    // Call the onModelSelectAction prop to inform parent component
    onModelSelectAction(selectedModel);
    setDropdownOpen(false);
  };

  // Mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPosition.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStartPosition.current.x;
        const newY = e.clientY - dragStartPosition.current.y;
        setPosition({ x: newX, y: newY });
      }
    },
    [isDragging]
  );

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

  // Render function
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
          {/* Title bar for dragging */}
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

          {/* Tabs */}
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

          {/* Content */}
          <div className="p-4">
            {activeTab === "settings" && configData && (
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
                <button
                  className="mt-4 rounded-md bg-blue-500 px-3 py-2 font-semibold text-white hover:bg-blue-600 focus:outline-none"
                  onClick={handleSettingsUpdate}
                >
                  Save Settings
                </button>
              </div>
            )}

            {activeTab === "models" && configData && (
              <div>
                {configData.models.map((modelConfig, index) => {
                  const modelName = modelConfig.name;
                  const modelIdentifier = modelConfig.model;
                  return (
                    <button
                      key={index}
                      className={`w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 ${
                        modelIdentifier === model ? "bg-gray-200" : ""
                      }`}
                      onClick={() => {
                        handleModelSelect(modelIdentifier);
                        alert(`Model selected: ${modelName}!`);
                      }}
                    >
                      {modelName}
                    </button>
                  );
                })}
                <Link href={"/models"}>
                  <button className="mt-4 rounded-md bg-blue-500 px-3 py-2 font-semibold text-white hover:bg-blue-600 focus:outline-none">
                    Add Model
                  </button>
                </Link>
              </div>
            )}

            {activeTab === "tools" && configData && (
              <div>
                {configData.defaultTools.length > 0 ? (
                  configData.defaultTools.map((c, i) => (
                    <div key={i} className="mb-4 ">
                      <p className="font-semibold text-gray-700">
                        {c.functionName}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700">No tools configured.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
