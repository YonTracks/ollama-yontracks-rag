// app/(root)/models/page.tsx

"use client";

import Link from "next/link";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaChevronDown, FaChevronUp, FaEdit, FaTrashAlt } from "react-icons/fa";

import { formatSize, formatDate } from "@/lib/utils/format";
import config from "@/ollama.config.json";

interface Model {
  name: string;
  size: string;
}

interface CurrentModel {
  name: string;
  size: number;
  model: string;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
  expires_at: string;
  size_vram: number;
}

function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [currentModel, setCurrentModel] = useState<CurrentModel | null>(null);
  const [lastSelectedModel, setLastSelectedModel] = useState<string | null>(
    null
  );
  const [configData, setConfigData] = useState(config);
  const [createModelName, setCreateModelName] = useState("llama3.2-mario");
  const [modelfileContent, setModelfileContent] = useState(`
FROM llama3.2
PARAMETER temperature 1
SYSTEM """You are Mario from Super Mario Bros. Answer as Mario, the assistant, only."""
  `);
  const [isModelsDropdownOpen, setIsModelsDropdownOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch("/api/models");
      if (!response.ok) throw new Error("Failed to fetch models");
      const data = await response.json();
      setModels(data.models);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  }, []);

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

  const fetchCurrentModel = useCallback(async () => {
    try {
      const response = await fetch("/api/currentModel");
      if (!response.ok) throw new Error("Failed to fetch current model");
      const data = await response.json();
      setCurrentModel(data.models?.[0] || null);
      if (data.models?.[0]) setLastSelectedModel(data.models[0].name);
    } catch (error) {
      console.error("Error fetching current model:", error);
    }
  }, []);

  const createModel = async () => {
    try {
      const response = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createModelName,
          modelfile: modelfileContent,
        }),
      });
      if (!response.ok) throw new Error("Failed to create model");
      setCreateModelName("");
      setModelfileContent("");
      fetchModels();
    } catch (error) {
      console.error("Error creating model:", error);
    }
  };

  const addModel = async (name: string) => {
    const updatedConfigData = {
      ...configData,
      models: [
        ...configData.models,
        {
          [name]: {
            name: `${name}`,
            description: `Description for ${name}`,
            settings: { temperature: 0.7, num_ctx: 2048, stream: true },
          },
        },
      ],
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
      alert(`${name} added successfully!`);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const removeModel = async (name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the model "${name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/models`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to remove model from server");

      // Remove the model from the local config data
      const updatedConfigData = {
        ...configData,
        models: configData.models.filter((model) => !model[name]),
      };

      //  Update the config file with the modified model list
      const configResponse = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfigData),
      });
      if (!configResponse.ok) throw new Error("Failed to update config file");

      setConfigData(updatedConfigData);
      fetchModels();

      alert(`${name} deleted successfully!`);
    } catch (error) {
      console.error("Error removing model:", error);
    }
  };

  useEffect(() => {
    fetchModels();
    fetchCurrentModel();
  }, [fetchCurrentModel, fetchModels]);

  const modelsDropdownLabel = useMemo(
    () => lastSelectedModel || "Show Models",
    [lastSelectedModel]
  );

  // Helper to check if a model is already in the config
  const isModelInConfig = (modelName: string) => {
    return configData.models.some((model) => model[modelName]);
  };

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col items-center p-4">
      <h1 className="mb-4 text-3xl font-semibold ">Models</h1>

      {/* Create Model Section */}
      <button
        onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
        className="mt-4 flex w-full max-w-3xl items-center justify-center rounded bg-blue-500 p-3 font-semibold text-white hover:bg-blue-600"
      >
        {isCreateDropdownOpen ? (
          <>
            Hide <FaChevronUp className="ml-2" />
          </>
        ) : (
          <>
            Create Model
            <FaChevronDown className="ml-2" />
          </>
        )}
      </button>

      {isCreateDropdownOpen && (
        <div className="mt-6 w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-700">
            Create New Model
          </h2>
          <div className="space-y-4">
            <textarea
              value={modelfileContent}
              onChange={(e) => setModelfileContent(e.target.value)}
              placeholder="Modelfile content"
              className="w-full rounded border border-gray-300 p-3 shadow-sm"
              rows={5}
            />
            <input
              value={createModelName}
              onChange={(e) => setCreateModelName(e.target.value)}
              placeholder="Model Name"
              className="w-full rounded border border-gray-300 p-3 shadow-sm"
            />
            <button
              onClick={createModel}
              className="w-full rounded bg-green-500 p-3 font-semibold text-white hover:bg-green-600"
            >
              Create Model
            </button>
          </div>
        </div>
      )}

      {/* Current Model Display */}
      {currentModel && (
        <div className="my-6 w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-center text-xl font-bold text-gray-700">
            Current Loaded Model
          </h2>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <p>
              <strong>Name:</strong> {currentModel.name}
            </p>
            <p>
              <strong>Size:</strong> {formatSize(currentModel.size)}
            </p>
            <p>
              <strong>Model:</strong> {currentModel.model}
            </p>
            <p>
              <strong>Expires At:</strong> {formatDate(currentModel.expires_at)}
            </p>
          </div>
        </div>
      )}

      {/* Models List and Actions */}
      <button
        onClick={() => setIsModelsDropdownOpen(!isModelsDropdownOpen)}
        className="mt-4 flex w-full max-w-3xl items-center justify-center rounded bg-blue-500 p-3 font-semibold text-white hover:bg-blue-600"
      >
        {isModelsDropdownOpen ? (
          <>
            Hide Models <FaChevronUp className="ml-2" />
          </>
        ) : (
          <>
            {modelsDropdownLabel} <FaChevronDown className="ml-2" />
          </>
        )}
      </button>

      {isModelsDropdownOpen && (
        <ul className="mt-6 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <li
              key={model.name}
              className="rounded-lg bg-gray-100 p-4 shadow-md transition hover:bg-gray-200"
            >
              <Link
                href={`models/${model.name}`}
                className="flex h-full flex-col justify-between"
              >
                <span className="mb-4 text-lg font-semibold text-gray-800">
                  {model.name}
                </span>
                <div className="mt-auto flex justify-between">
                  {isModelInConfig(model.name) ? (
                    <span className="font-semibold text-green-500">Added</span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addModel(model.name);
                      }}
                      className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                    >
                      Add
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeModel(model.name);
                    }}
                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                  >
                    <FaTrashAlt size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                  >
                    <FaEdit size={18} />
                  </button>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ModelsPage;
