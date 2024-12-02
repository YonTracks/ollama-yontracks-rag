// lib/tools/toolsJson.ts

import { Tool } from "ollama";

/**
 * An array of tool configurations that define functions which can be used throughout the application.
 *
 * Each tool in the array contains:
 * - `type`: The type of the tool (in this case, all are functions).
 * - `functionName`: A human-readable name for the function.
 * - `function`: An object describing the function itself, including:
 *   - `name`: The internal name of the function.
 *   - `description`: A brief explanation of what the function does.
 *   - `parameters`: The input parameters required for the function, structured as a JSON schema.
 */
export const tools: Tool[] = [
  {
    type: "function",
    function: {
      name: "get_flight_times",
      description: "Get the flight times between two cities",
      parameters: {
        type: "object",
        properties: {
          departure: {
            type: "string",
            description: "The departure city (airport code)",
          },
          arrival: {
            type: "string",
            description: "The arrival city (airport code)",
          },
        },
        required: ["departure", "arrival"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_current_weather",
      description: "Get the current weather for a city",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The name of the city",
          },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_future_weather_week",
      description: "Get the future weather for the next week for a given city",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The name of the city",
          },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_regular_response",
      description: "Respond to the user based on the prompt",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "The user prompt",
          },
        },
        required: ["prompt"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "perform_reasoning",
      description:
        "Perform complex reasoning or calculations based on the provided problem description.",
      parameters: {
        type: "object",
        properties: {
          problem: {
            type: "string",
            description: "The problem description to reason about.",
          },
        },
        required: ["problem"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_delivery_date",
      description: "Get the delivery date for a customer's order.",
      parameters: {
        type: "object",
        properties: {
          order_id: {
            type: "string",
            description: "The customer's order ID.",
          },
        },
        required: ["order_id"],
      },
    },
  },
];
