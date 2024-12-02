// lib/tools/getLatLong.ts

/**
 * Fetches the latitude and longitude for a given city by sending a request to the /api/ollama endpoint.
 *
 * @param city The name of the city to retrieve latitude and longitude for.
 * @returns A promise that resolves to an object containing the latitude and longitude as strings, or an error message if the operation fails.
 */
export const getLatLong = async (
  city: string
): Promise<{ latitude: string; longitude: string } | { error: string }> => {
  console.log("Getting latitude and longitude for:", city);

  try {
    // Send a request to the /api/ollama endpoint with the prompt asking for the latitude and longitude
    const response = await fetch("/api/ollama", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.1",
        prompt: `Get the latitude and longitude for ${city}`,
        context: [],
      }),
    });

    // Check if the response was successful
    if (!response.ok) {
      console.error("Failed to fetch latitude and longitude");
      return { error: "Failed to fetch latitude and longitude" };
    }

    const reader = response.body?.getReader(); // Set up a reader to handle streamed responses
    const decoder = new TextDecoder(); // Decode streamed response chunks
    let accumulatedResponse = ""; // Accumulate the response chunks

    // Read the response stream and accumulate the data
    while (true) {
      try {
        const { done, value } = await reader!.read();
        if (done) break;
        accumulatedResponse += decoder.decode(value);
      } catch (error) {
        console.error("Error reading response:", error);
      }
    }

    // Split the accumulated response into chunks and filter out empty lines
    const responseChunks = accumulatedResponse
      .split("\n")
      .filter((chunk) => chunk.trim() !== "");

    let fullResponse = "";
    // Concatenate the parsed JSON response chunks
    responseChunks.forEach((chunk) => {
      const parsedChunk = JSON.parse(chunk);
      fullResponse += parsedChunk.response;
    });

    console.log("Full response:", fullResponse);

    /**
     * Use a regular expression to match the latitude and longitude pattern from the response.
     * The expected format is something like:
     *   Latitude: 40.7128° N
     *   Longitude: 74.0060° W
     */
    const matches = fullResponse.match(
      /Latitude:\s*([-+]?[0-9]*\.?[0-9]+)[°]?\s*([NS])[\s\S]*?Longitude:\s*([-+]?[0-9]*\.?[0-9]+)[°]?\s*([EW])/
    );

    console.log("Matches:", matches);

    // If the regex matches successfully, format and return the latitude and longitude
    if (matches && matches.length >= 5) {
      const latitude = matches[2] === "S" ? `-${matches[1]}` : matches[1];
      const longitude = matches[4] === "W" ? `-${matches[3]}` : matches[3];
      console.log("Latitude:", latitude, "Longitude:", longitude);
      return { latitude, longitude };
    } else {
      console.error("Could not extract latitude and longitude");
      return { error: "Could not extract latitude and longitude" };
    }
  } catch (error) {
    // Catch and log any errors during the fetch operation
    console.error("Error fetching latitude and longitude:", error);
    return { error: "Error fetching latitude and longitude" };
  }
};
