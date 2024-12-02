// lib/tools/getReasoningSteps.ts

/**
 * Perform reasoning steps based on the provided prompt.
 * @param problem - The problem description for reasoning.
 * @param requestId - The unique request ID for tracking.
 * @returns The reasoning steps.
 */
export const getReasoningSteps = async (
  problem: string,
  requestId: string
): Promise<string> => {
  try {
    console.log(
      "Sending request to llama3.1-reflection with problem:",
      problem
    );

    /**
     * This could be any model function or API endpoint you are using for reasoning.
     * The reflection example is the `llama3.1-reflection` modelfile example in the models page?
     * Please create or adjust accordingly
     */

    const response = await fetch("/api/ollama", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "request-id": requestId, // Include the request ID in the headers
      },
      body: JSON.stringify({
        model: "llama3.1-reflection",
        prompt: problem,
        context: [], // Optionally include context if needed
        stream: true, // Streaming response to process large content progressively
      }),
    });
    console.log("Received response from llama3.1-reflection");
    // Check for non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      alert(
        `Conversion failed: Create llama3.1-reflection model or ${errorText}`
      );
      throw new Error(
        `Conversion failed: Create llama3.1-reflection model or ${errorText}`
      );
    }
    console.log("Processing response from llama3.1-reflection...");
    // Process the streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedResponse = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      accumulatedResponse += decoder.decode(value, { stream: true });
    }

    // Split the accumulated response into chunks and process them
    const responseChunks = accumulatedResponse
      .split("\n")
      .filter((chunk) => chunk.trim() !== "");

    let fullResponse = "";
    responseChunks.forEach((chunk) => {
      try {
        const parsedChunk = JSON.parse(chunk); // Parse each chunk of the streamed response

        if (parsedChunk.response) {
          fullResponse += parsedChunk.response; // Append the response from the chunk
        } else if (parsedChunk.message?.content) {
          fullResponse += parsedChunk.message.content; // Handle other message content
        }
      } catch (error) {
        console.error("Error parsing chunk:", error);
      }
    });

    // Return the processed reasoning steps result, or indicate no result if empty
    return `Reasoning Steps result: ${fullResponse || "No result returned"}`;
  } catch (error: unknown) {
    console.error("Error in reasoning steps processing:", error);

    // Return a user-friendly error message
    return JSON.stringify({
      error: `Reasoning steps processing failed: ${
        error || "Please try again later."
      }`,
    });
  }
};
