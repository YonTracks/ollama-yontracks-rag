// app/(root)/models/[modelId]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { GenerateResponse } from "ollama";
import { useState, useEffect, useRef, useCallback } from "react";
import { FaTrashAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { v4 as uuidv4 } from "uuid";

import CodeBlockComponent from "@/components/CodeBlockComponent";
import PromptList from "@/components/PromptList";
import useLocalStorage from "@/hooks/useLocalStorage";
import { extractCodeSnippets } from "@/lib/utils/extractCodeSnippets";
import { StreamParser } from "@/lib/utils/streamParser";
import { Conversation } from "@/types/conversations";

function ModelPage() {
  const params = useParams<{ modelId: string }>();

  const modelId = decodeURIComponent(params.modelId).replace(":latest", "");
  const [model] = useState(modelId);
  const [, setModelData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [context, setContext] = useLocalStorage<number[]>(
    `${model}-context`,
    []
  );
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(
    `${model}-conversations`,
    []
  );
  const [isStreaming, setIsStreaming] = useState(false);

  const responseContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchModelDetails = async () => {
      try {
        const result = await fetch("/api/model", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model }),
        });

        if (!result.ok) {
          throw new Error("Failed to fetch model details");
        }

        const data = await result.json();
        console.log("show:", data);
        setModelData(data);
      } catch (error) {
        console.error("Failed to fetch model details", error);
      }
    };

    fetchModelDetails();
  }, [model]);

  const scrollToEnd = useCallback(() => {
    if (responseContainerRef.current) {
      responseContainerRef.current.scrollTop =
        responseContainerRef.current.scrollHeight;
    }
  }, []);

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

      if (!result.ok) {
        const errorMessage = await result.text();
        console.error("API Error:", errorMessage);
        throw new Error(errorMessage);
      }

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
        console.log("Non-streaming response:", responseData.response);
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
          fullResponse += parsedData.response;
          setResponse(fullResponse);
          scrollToEnd();
        }
        if (parsedData.done) {
          console.log("parsedData:", parsedData);
          if (parsedData.context) {
            setContext(parsedData.context);
            console.log("Updated context:", parsedData.context);
          }
          console.log("Streaming response:", fullResponse);
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendPrompt();
      }
    };

    const textarea = document.querySelector(
      ".text-input"
    ) as HTMLTextAreaElement;

    if (textarea) {
      textarea.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [sendPrompt]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [response, scrollToEnd]);

  const handleNewChat = () => {
    setConversations([]);
    setContext([]);
  };

  // Delete a specific conversation
  const handleDeleteChat = (index: number) => {
    setConversations(conversations.filter((_, i) => i !== index));
    setContext(context.filter((_, i) => i !== index));
  };

  if (!isClient) return null; // Ensure client-side rendering

  return (
    <div className="flex w-full flex-col items-center justify-center p-4">
      <h1 className="mb-2 text-xl sm:mb-4 sm:text-2xl">Model: {model}</h1>
      <div className="m-2 flex w-full max-w-full flex-col space-y-4 rounded-lg p-4 shadow-md sm:m-4 sm:max-w-4xl sm:p-6">
        <div className="mb-4 flex justify-between">
          <button
            className="rounded-md bg-green-500 px-3 py-2 font-semibold text-white hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300 sm:px-4"
            onClick={handleNewChat}
          >
            New Chat
          </button>
        </div>

        {conversations.length === 0 && !loading && (
          <PromptList setPrompt={setPrompt} />
        )}

        <div
          style={{ height: "24rem" }}
          className="my-6 flex h-64 resize flex-col space-y-4 overflow-y-auto p-2 sm:my-12 sm:h-96"
          ref={responseContainerRef}
        >
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
                    className="m-0 inline-flex size-auto items-center justify-center p-0 hover:text-red-600 focus:outline-none"
                    onClick={() => handleDeleteChat(index)}
                    aria-label="Delete chat"
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </div>

                {/* User Prompt */}
                <div className="flex items-center justify-end space-x-2">
                  <div className="w-auto max-w-xs break-words rounded-lg bg-blue-500 p-2 text-white shadow-sm sm:p-4 md:max-w-md">
                    {conversation.prompt}
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="break-words rounded-lg shadow-sm">
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
              <div className="break-words rounded-lg shadow-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
        {/* Loading Indicator */}
        {loading && (
          <div className="w-full self-start sm:w-auto">
            <div className="mt-4 w-full max-w-xs break-words rounded-lg bg-green-500 px-4 py-2 text-white shadow-sm sm:max-w-md">
              <h1 className="animate-pulse text-sm sm:text-base">
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
      <div className="fixed bottom-0 w-full max-w-full border-gray-200 sm:max-w-4xl">
        <div className="mt-2 flex space-x-2 px-4 py-2">
          <textarea
            className="grow rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-300 focus:outline-none focus:ring sm:p-4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message..."
            rows={3}
          />
          {/* Send or Stop Button */}
          {!isStreaming ? (
            <button
              className="rounded-md bg-blue-500 px-3 py-2 font-semibold text-white shadow hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 sm:px-4"
              onClick={sendPrompt}
              disabled={loading}
            >
              Send
            </button>
          ) : (
            <button
              className="rounded-md bg-red-500 px-3 py-2 font-semibold text-white shadow hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 sm:px-4"
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

export default ModelPage;
