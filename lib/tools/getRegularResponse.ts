// lib/tools/getRegularResponse.ts

/**
 * Processes the input content and returns a regular response. The function checks for specific patterns
 * such as counting problems or complex questions before generating the response.
 *
 * @param content The user-provided content or question as a string.
 * @returns A promise that resolves to a string response based on the detected patterns, or a regular response.
 */
export const getRegularResponse = async (content: string): Promise<string> => {
  try {
    // Log the content to check for any patterns
    console.log(
      "Checking for math or counting patterns in the content:",
      content
    );

    // Convert the content to a JSON string for pattern matching
    const contentString = JSON.stringify(content);

    /**
     * Regular expression to detect counting problems.
     * Example phrases it can detect:
     *  - "How many apples are in the basket?"
     *  - "How many people are in the room?"
     */

    const countingPattern = /how (?:many|may) ?(\w+)? ?(?:in|of)? ?(.+)/i;

    /**
     * Regular expression to detect complex questions involving reasoning or calculations.
     * Example phrases it can detect:
     *  - "Calculate the area of the triangle."
     *  - "What is the result of 5 + 5?"
     *  - "Solve this equation."
     */

    // const complexQuestionPattern = /(calculate|solve|reason|find|what is)/i;
    const complexQuestionPattern =
      /(calculate|solve|reason|derive|analyze|evaluate|optimize|find|what (is|are|if)|how (many|much|does|do|can)|why|explain|prove|estimate|determine|model|simulate|compare|compute|assess)/i;

    // Log whether the content matches the counting pattern
    console.log("Counting Pattern:", countingPattern.test(contentString));

    // Log whether the content matches the complex question pattern
    console.log("Complex Pattern:", complexQuestionPattern.test(contentString));

    // If a counting pattern is detected, log it
    if (countingPattern.test(contentString)) {
      console.log("Counting pattern detected:", contentString);
      console.log("Something could happen here:");
    }

    // If a complex question pattern is detected, log it
    if (complexQuestionPattern.test(contentString)) {
      console.log("Complex question pattern detected:", contentString);
      console.log("Something could happen here:");
    }

    // Return a regular response if no specific patterns are processed
    return `Reply based on the following prompt: ${contentString}`;
  } catch (error) {
    // Catch and log any errors encountered during processing
    console.error("Error in getRegularResponse:", error);

    // Return an error message in case of failure
    return JSON.stringify({ error: "Processing failed" });
  }
};
