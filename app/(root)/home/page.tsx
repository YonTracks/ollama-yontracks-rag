// app/(root)/home/page.tsx

"use client";

import Image from "next/image";
import { ChatResponse } from "ollama";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { FaTrashAlt, FaUpload } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { v4 as uuidv4 } from "uuid";

import CodeBlockComponent from "@/components/CodeBlockComponent";
import PromptList from "@/components/PromptList";
import RunCodeComponent from "@/components/RunCodeComponent";
import SettingsMenu from "@/components/SettingsMenu";
import useIndexedDB from "@/hooks/useIndexedDB";
import { extractCodeSnippets } from "@/lib/utils/extractCodeSnippets";
import { extractPythonCode } from "@/lib/utils/extractPythonCode";
import { StreamParser } from "@/lib/utils/streamParser";
import config from "@/ollama.config.json";
import { Conversation } from "@/types/conversations";

type Position = { x: number; y: number };

export default function HomePage() {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [, setConfigData] = useState(config);
  const [model, setModel] = useState(config.globalSettings.defaultModel);
  const [visionEnabled] = useState<boolean>(
    config.globalSettings.visionEnabled
  );
  const [ipythonEnabled] = useState<boolean>(
    config.globalSettings.ipythonEnabled
  );
  const [prompt, setPrompt] = useState("");
  const [base64Image, setBase64Image] = useState<string | null>();
  // Temporary state for the current streaming response
  const [streamedResponse, setStreamedResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useIndexedDB<number[]>("home-rag-context", []);
  const [conversations, setConversations] = useIndexedDB<Conversation[]>(
    "home-rag-conversations",
    []
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelDownloaded, setModelDownloaded] = useState(false);
  const [, setDropdownOpen] = useState(false);
  const [, setPosition] = useState<Position>({ x: -220, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs for DOM elements
  const responseContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to scroll to the end of the conversation
  const scrollToEnd = useCallback(() => {
    if (responseContainerRef.current) {
      responseContainerRef.current.scrollTop =
        responseContainerRef.current.scrollHeight;
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

  // Fetch available models and check if the default model is downloaded
  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch("/api/models");
      if (!response.ok) {
        alert("Please ensure Ollama is running.");
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();
      const availableModels = data.models;
      const defaultModelExists = availableModels.some((m: { name: string }) =>
        m.name.startsWith(model)
      );

      setModelDownloaded(defaultModelExists);

      if (!defaultModelExists) {
        alert(
          `Model ${model} is not available. Please download it first or change the default model in settings to one that is available.`
        );
        throw new Error("Default model is not available");
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  }, [model]);

  // Function to stop the ongoing stream
  const stopStream = useCallback(async () => {
    try {
      console.log("Stopping stream for model:", model);
      const response = await fetch("/api/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model }),
      });

      const result = await response.json();
      console.log("Stopping response:", result);

      if (!response.ok) {
        console.error("Failed to stop the stream:", result.error);
        throw new Error(result.error);
      }

      // Reload the page to reset the state
      setTimeout(() => {
        console.log("Stream successfully stopped");
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
  }, [model]);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(",")[1];
        if (base64String) {
          setBase64Image(base64String);
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const clearImage = () => setBase64Image(null);

  const constructMessages = useCallback(() => {
    const systemMessage = ipythonEnabled
      ? { role: "system", content: "Environment: ipython" }
      : null;

    return [
      ...(systemMessage ? [systemMessage] : []),
      ...conversations.map((conv) => ({
        role: "user",
        content: conv.prompt,
      })),
      ...conversations.map((conv) => ({
        role: "assistant",
        content: conv.response,
      })),
      {
        role: "user",
        content: prompt,
        ...(base64Image && { images: [base64Image] }),
      },
    ];
  }, [ipythonEnabled, conversations, prompt, base64Image]);

  // Function to send the user's prompt to the API
  const sendPrompt = useCallback(async () => {
    if (!prompt.trim() && !base64Image) {
      console.log("Prompt and image are empty, skipping.");
      return;
    }

    console.log("Sending prompt:", prompt);
    setLoading(true);
    console.log("context:", context);
    const requestId = uuidv4(); // Unique identifier for this request
    const currentPrompt = prompt;
    const currentImage = base64Image;
    setPrompt("");
    setStreamedResponse("");

    try {
      // Construct the messages array
      const messages = constructMessages();

      console.log("Constructed messages:", messages);

      const response = await fetch("/api/ollamaChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "request-id": requestId,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        console.log("Response status is not OK:", response.status);
        const errorData = await response.json();
        console.error("Error from server:", errorData.error);
        throw new Error(errorData.error || "Failed to fetch response.");
      }

      if (!response.body) {
        console.error("Response body is null. No streaming possible.");
        throw new Error("No response body for streaming.");
      }

      console.log("Streaming response started...");
      let fullResponse = "";
      setIsStreaming(true);

      const onParse = (parsedData: ChatResponse) => {
        if (parsedData.message) {
          fullResponse += parsedData.message.content;
          setStreamedResponse(fullResponse);
          scrollToEnd();
        }
        if (parsedData.done) {
          // console.log("Streaming completed. Full response:", fullResponse);

          setConversations((prev) => [
            ...prev,
            {
              id: uuidv4(),
              prompt: currentPrompt,
              image: currentImage,
              response: fullResponse,
              timestamp: Date.now(),
            },
          ]);
          setStreamedResponse("");
          setLoading(false);
          setIsStreaming(false);
          scrollToEnd();
        }
      };

      const onFinish = () => {
        console.log("Streaming finished.");
        setLoading(false);
        setIsStreaming(false);
      };

      const onError = (error: unknown) => {
        console.error("Error during streaming:", error);
        setLoading(false);
        setIsStreaming(false);
        setStreamedResponse("Error generating response.");
      };

      const parser = new StreamParser(
        { format: "ollama" },
        onParse,
        onFinish,
        onError
      );
      await parser.parse(response.body!);
    } catch (error) {
      console.error("Error in sendPrompt:", error);
      setStreamedResponse("An error occurred while generating the response.");
      setLoading(false);
      setIsStreaming(false);
    }
  }, [
    prompt,
    base64Image,
    context,
    constructMessages,
    model,
    scrollToEnd,
    setConversations,
  ]);

  // Set the client-side rendering flag and fetch models on component mount
  useEffect(() => {
    setIsClient(true);
    fetchModels();
  }, [fetchModels]);

  // Scroll to the end whenever conversations update
  useLayoutEffect(() => {
    scrollToEnd();
  }, [conversations, scrollToEnd]);

  // Handle "Enter" key press in the textarea
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); // Prevent newline
        sendPrompt(); // Send prompt
      }
    };

    const textarea = textareaRef.current;
    if (textarea) textarea.addEventListener("keydown", handleKeyDown);

    return () => textarea?.removeEventListener("keydown", handleKeyDown);
  }, [sendPrompt]);

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

  // Attach and remove event listeners for dragging
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

  // Function to select model
  const handleModelSelect = (selectedModel: string) => {
    setModel(selectedModel);
    setDropdownOpen(false);
  };

  // Start a new chat session
  const handleNewChat = () => {
    setContext([]);
    setConversations([]);
  };

  // Delete a specific conversation
  const handleDeleteChat = (index: number) => {
    setConversations(conversations.filter((_, i) => i !== index));
    setContext(context.filter((_, i) => i !== index));
  };

  if (!isClient) return null; // Ensure client-side rendering

  return (
    <div className="flex w-full flex-col items-center justify-center p-2 sm:p-4">
      <h1 className="mb-2 text-xl sm:mb-4 sm:text-2xl">Ollama test</h1>

      <div className="m-2 flex w-full max-w-full flex-col space-y-4 rounded-lg p-4 shadow-md sm:m-4 sm:max-w-4xl sm:p-6">
        <div className="mb-4 flex justify-between">
          <button
            className="rounded-full bg-green-500 px-3 py-2 font-semibold text-white hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300 sm:px-4"
            onClick={() => {
              // Reset position on New Chat
              setPosition({ x: -220, y: 0 });
              handleNewChat();
            }}
          >
            New Chat
          </button>

          <SettingsMenu model={model} onModelSelectAction={handleModelSelect} />
        </div>

        {/* Prompt List when no conversations */}
        {conversations.length === 0 && !loading && (
          <PromptList setPrompt={setPrompt} />
        )}

        {/* Conversation Display */}
        <div
          style={{ height: "24rem" }}
          className="my-6 flex h-64 resize flex-col space-y-4 overflow-y-auto p-2 sm:my-12 sm:h-96"
          ref={responseContainerRef}
        >
          {/* Render each conversation */}
          {conversations.map((conversation, index) => {
            // console.log("Full response for extraction:", conversation);
            const codeSnippets = extractCodeSnippets(conversation.response);
            const pythonSnippets = extractPythonCode(conversation.response);
            // console.log("Python snippets extracted:", pythonSnippets);
            const parts = conversation.response.split(/```[\s\S]*?```/g);

            return (
              <div
                key={index}
                className="flex flex-col space-y-2 rounded-xl p-2 sm:p-4"
              >
                {/* Delete Button */}
                <div className="flex justify-end">
                  <button
                    className="hover:text-red-600"
                    onClick={() => handleDeleteChat(index)}
                    aria-label="Delete chat"
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </div>

                {/* User Prompt and Image */}
                <div className="flex items-center justify-end space-x-2">
                  <div className="w-auto max-w-xs break-words rounded-lg bg-blue-500 p-2 text-white shadow-sm sm:p-4 md:max-w-md">
                    {conversation.prompt}
                  </div>
                  {conversation.image && (
                    <Image
                      src={`data:image/png;base64,${conversation.image}`}
                      alt="Uploaded"
                      className="rounded-lg shadow-md"
                      width={150}
                      height={150}
                    />
                  )}
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="break-words rounded-lg shadow-sm">
                    {parts.map((part, i) => (
                      <div key={i} className="mb-4">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {part}
                        </ReactMarkdown>
                        {pythonSnippets && pythonSnippets[i] && (
                          <RunCodeComponent
                            code={pythonSnippets[i].code}
                            lang={pythonSnippets[i].language}
                          />
                        )}
                        {codeSnippets && codeSnippets[i] && (
                          <CodeBlockComponent
                            code={codeSnippets[i].code}
                            lang={codeSnippets[i].language}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {/* Streaming Response */}
          {streamedResponse && (
            <div className="self-start">
              <div className="break-words rounded-lg shadow-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamedResponse}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="w-full self-start sm:w-auto">
            <div className="mt-4 w-full max-w-xs break-words rounded-lg bg-green-500 px-4 py-2 shadow-sm sm:max-w-md">
              <h1 className="animate-pulse text-sm text-white sm:text-base">
                Thinking...
              </h1>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {conversations.length > 0 && (
        <div className="z-20 flex justify-center pb-4">
          <button
            className="rounded-full bg-blue-500/80 px-2 font-semibold text-white hover:bg-blue-600/90 focus:outline-none focus:ring focus:ring-blue-300"
            onClick={scrollToEnd}
          >
            ↓
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="fixed bottom-0 w-full border-gray-300 py-3">
        <div className="mx-auto flex max-w-3xl items-center px-4">
          {/* Input Container */}
          <div className="relative flex flex-1 items-center rounded-lg border border-gray-300 bg-gray-50 shadow-sm focus-within:ring focus-within:ring-blue-300">
            {/* Image Upload */}
            {visionEnabled && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    title="Upload Image"
                    className="hidden"
                  />
                  <div className="flex items-center justify-center">
                    {base64Image ? (
                      <div className="relative">
                        <Image
                          src={`data:image/png;base64,${base64Image}`}
                          alt="Uploaded"
                          className="cursor-pointer rounded-full object-cover"
                          title="Upload Image"
                          width={30}
                          height={30}
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            clearImage();
                          }}
                          className="absolute -right-2 -top-2 z-20 flex size-5 items-center justify-center rounded-full text-red-500 shadow-md hover:bg-red-500 hover:text-white"
                          title="Remove Image"
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      </div>
                    ) : (
                      <FaUpload
                        size={20}
                        className="text-gray-500 hover:text-blue-500"
                        title="Upload Image"
                      />
                    )}
                  </div>
                </label>
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              className="h-20 w-full resize-none rounded-lg border-none px-14 py-4 text-sm placeholder:text-gray-500 focus:outline-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your message here..."
              rows={1}
            />

            {/* Send or Stop Button */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {!isStreaming ? (
                <button
                  onClick={sendPrompt}
                  disabled={loading || !modelDownloaded}
                  className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-gray-300"
                  title="Send Message"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              ) : (
                <button
                  onClick={stopStream}
                  className="flex size-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
                  title="Stop Stream"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
