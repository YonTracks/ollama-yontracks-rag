// // lib/tools/performReasoning.ts

// import { evaluate } from "mathjs";

/**
 * Perform complex reasoning or calculations based on the provided problem description.
 * @param args - The arguments containing the problem description.
 * @returns The result of the reasoning or calculation.
 */

// reflection version for reasoning and math calculations example.
export const performReasoning = async (args: {
  problem: string;
}): Promise<string> => {
  const { problem } = args;
  try {
    // Evaluate the problem using a custom logic function
    const result = await evaluateProblem(problem);
    return `${result}`;
  } catch (error) {
    console.error("Error in performReasoning:", error);
    return "Unable to perform reasoning on the provided problem.";
  }
};

// Enhanced evaluator function
const evaluateProblem = async (problem: string): Promise<string | number> => {
  /* if (problem.includes("use-reflection")) {
    const refectionResult = await getReasoningSteps(
      problem,
      "getReasoningSteps-call"
    );
    return JSON.stringify(refectionResult);
  }
  */
  // Detect counting problems such as "How many r's in raspberry?"
  console.log("EvaluatingProblem...", problem);
  const regexForCounting = /how (?:many|may) ?(\w+)? ?(?:in|of)? ?(.+)/i;
  const mathMatch = JSON.stringify(problem).match(regexForCounting);

  const regexForComplexQuestion =
    /(calculate|solve|reason|derive|analyze|evaluate|optimize|find|what (is|are|if)|how (many|much|does|do|can)|why|explain|prove|estimate|determine|model|simulate|compare|compute|assess)/i;
  const complexMatch = JSON.stringify(problem).match(regexForComplexQuestion);
  console.log("Something could happen here also:");
  if (complexMatch) {
    console.log("EvaluatingComplexQuestion...", complexMatch);
    console.log("Complex pattern detected");
    /*
    const refectionResult = await getReasoningSteps(
      problem,
      "getReasoningSteps-call"
    );
    return JSON.stringify(refectionResult);
  
*/
    // const mathResult = await performMath(problem, "math-call");

    // return JSON.stringify(mathResult);
    console.log("Something could happen here:");
  } else if (mathMatch) {
    console.log("EvaluatingMathQuestion...", mathMatch);
    console.log("Counting pattern detected");
    // const mathResult = await performMath(problem, "math-call");

    // return JSON.stringify(mathResult);
    console.log("Something could happen here:");
  }

  // Default response if no specific handling is found
  return problem;
};
