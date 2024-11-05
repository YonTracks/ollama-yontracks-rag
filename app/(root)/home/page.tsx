// app/(root)/home/page.tsx

"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { GenerateResponse } from "@/types/interfaces";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useLocalStorage from "@/hooks/useLocalStorage";
import CodeBlockComponent from "@/components/CodeBlockComponent";
import PromptList from "@/components/PromptList";
import { extractCodeSnippets } from "@/lib/utils/extractCodeSnippets";
import { v4 as uuidv4 } from "uuid";
import config from "@/ollama.config.json";
import { StreamParser } from "@/lib/utils/streamParser";
import { Conversation } from "@/types/conversations";
import { FaTrashAlt, FaEllipsisV } from "react-icons/fa";

export default function HomePage() {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [model] = useState(config.globalSettings.defaultModel);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [context, setContext] = useLocalStorage<number[]>(
    "home-rag-context",
    []
  );
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(
    "home-rag-conversations",
    []
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelDownloaded, setModelDownloaded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
        alert(`Model ${model} is not available. Please download it first.`);
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

  // Function to send the user's prompt to the API
  const sendPrompt = useCallback(async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    const currentContext = Array.from(new Set(context)); // Remove duplicate contexts
    const currentPrompt = prompt;
    const requestId = uuidv4(); // Generate a unique request ID

    console.log("Generated requestId:", requestId);
    setPrompt("");
    setResponse("");

    try {
      const result = await fetch("/api/ollama", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "request-id": requestId, // Add requestId to headers
        },
        body: JSON.stringify({
          model,
          prompt: currentPrompt,
          context: currentContext,
          stream: true,
        }),
      });

      // Handle non-streaming response
      if (
        !result.body ||
        !result.headers.get("Content-Type")?.includes("application/json")
      ) {
        const responseData = await result.json();
        if (responseData.error) {
          throw new Error(responseData.error);
        }
        setResponse(responseData.response);
        setConversations((prev) => [
          ...prev,
          {
            id: uuidv4(),
            prompt: currentPrompt,
            response: responseData.response,
            timestamp: Date.now(),
          },
        ]);
        setLoading(false);
        setIsStreaming(false);
        return;
      }

      // Streaming response
      let fullResponse = "";
      setIsStreaming(true);

      const onParse = (parsedData: GenerateResponse) => {
        if (parsedData.response) {
          fullResponse += parsedData?.response;
          setResponse(fullResponse);
          scrollToEnd();
        }
        if (parsedData?.done) {
          if (parsedData.context) {
            setContext(parsedData.context);
          }
          setConversations((prev) => [
            ...prev,
            {
              id: uuidv4(),
              prompt: currentPrompt,
              response: fullResponse,
              timestamp: Date.now(),
            },
          ]);
          setResponse("");
          setLoading(false);
          setIsStreaming(false);
          scrollToEnd();
        }
      };

      const onFinish = () => {
        setLoading(false);
        setIsStreaming(false);
        scrollToEnd();
      };

      const onError = (error: unknown) => {
        console.error("Stream parsing error:", error);
        setLoading(false);
        setIsStreaming(false);
        setResponse("An error occurred while generating the response.");
      };

      const parser = new StreamParser(
        { format: "ollama" }, // Use 'openai' if interacting with OpenAI API
        onParse,
        onFinish,
        onError
      );

      await parser.parse(result.body!);
    } catch (error) {
      console.error("Error in sendPrompt:", error);
      setLoading(false);
      setIsStreaming(false);
      setResponse("An error occurred while generating the response.");
    }
  }, [prompt, context, model, setContext, setConversations, scrollToEnd]);

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

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
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
    <div className="flex flex-col w-full justify-center items-center p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl mb-2 sm:mb-4">
        Generate Chat Completion
      </h1>

      {/* Conversation Container */}
      <div className="w-full max-w-full sm:max-w-4xl rounded-lg shadow-md m-2 sm:m-4 p-4 sm:p-6 flex flex-col space-y-4">
        {/* Header with New Chat button */}
        <div className="flex justify-between mb-4">
          <button
            className="px-3 sm:px-4 py-2 font-semibold bg-green-500 rounded-md text-white hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
            onClick={handleNewChat}
          >
            New Chat
          </button>

          {/* Dropdown Menu Button */}
          <div className="relative">
            <button
              className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
              onClick={toggleDropdown}
            >
              <FaEllipsisV />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                onClick={toggleDropdown}
                className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg"
              >
                <label className="flex justify-center text-gray-700">
                  models
                </label>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  llama3.1
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  llama3.1-params
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  llama3.2
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Prompt List when no conversations */}
        {conversations.length === 0 && !loading && (
          <PromptList setPrompt={setPrompt} />
        )}

        {/* Conversation Display */}
        <div
          style={{ height: "24rem" }}
          className="flex flex-col resize space-y-4 overflow-y-auto h-64 sm:h-96 p-2 my-6 sm:my-12"
          ref={responseContainerRef}
        >
          {/* Render each conversation */}
          {conversations.map((conversation, index) => {
            const snippets = extractCodeSnippets(conversation.response);
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

                {/* User Prompt */}
                <div className="flex justify-end items-center space-x-2">
                  <div className="max-w-xs bg-blue-500 p-2 sm:p-4 rounded-lg text-white md:max-w-md w-auto break-words shadow-sm">
                    {conversation.prompt}
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="rounded-lg break-words shadow-sm">
                    {parts.map((part, i) => (
                      <div key={i} className="mb-4">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {part}
                        </ReactMarkdown>
                        {snippets && snippets[i] && (
                          <CodeBlockComponent
                            code={snippets[i].code}
                            lang={snippets[i].language}
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
          {response && (
            <div className="self-start">
              <div className="rounded-lg break-words shadow-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="self-start w-full sm:w-auto">
            <div className="px-4 py-2 mt-4 rounded-lg bg-green-500 w-full max-w-xs sm:max-w-md break-words shadow-sm">
              <h1 className="animate-pulse text-white text-sm sm:text-base">
                Thinking...
              </h1>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {conversations.length > 0 && (
        <div className="z-20 pb-4 flex justify-center">
          <button
            className="px-2 font-semibold bg-blue-500/80 rounded-full text-white hover:bg-blue-600/90 focus:outline-none focus:ring focus:ring-blue-300"
            onClick={scrollToEnd}
          >
            ↓
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="w-full max-w-full sm:max-w-4xl fixed bottom-0 border-gray-200">
        <div className="flex space-x-2 mt-2 px-4 py-2">
          <textarea
            ref={textareaRef}
            className="text-input flex-grow p-2 sm:p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message..."
            rows={3}
          />
          {/* Send or Stop Button */}
          {!isStreaming ? (
            <button
              className="px-3 sm:px-4 py-2 font-semibold bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
              onClick={sendPrompt}
              disabled={loading || !modelDownloaded}
            >
              Send
            </button>
          ) : (
            <button
              className="px-3 sm:px-4 py-2 font-semibold bg-red-500 text-white rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
              onClick={stopStream}
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
