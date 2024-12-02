// lib/utils/executeTool.ts

import { getDeliveryDate } from "@/lib/tools/getDeliveryDate";
import { getFlightTimes } from "@/lib/tools/getFlightTimes";
import { getRegularResponse } from "@/lib/tools/getRegularResponse";
import {
  getCurrentWeather,
  getFutureWeatherWeek,
} from "@/lib/tools/getWeather";
import { performReasoning } from "@/lib/tools/performReasoning";

/**
 * Executes a tool based on the provided name and arguments.
 * @param toolName - Name of the tool to execute
 * @param args - Arguments to pass to the tool function
 */

export const executeTool = async (
  toolName: string,
  args: string | object
): Promise<string> => {
  console.log(`Executing tool: ${toolName} with arguments:`, args);
  const availableFunctions: {
    [key: string]: (args: string) => Promise<string>;
  } = {
    get_flight_times: getFlightTimes,
    get_current_weather: getCurrentWeather,
    get_future_weather_week: getFutureWeatherWeek,
    get_regular_response: getRegularResponse,
    perform_reasoning: performReasoning,
    get_delivery_date: getDeliveryDate,
  };

  if (availableFunctions[toolName]) {
    try {
      // Execute the tool function with provided arguments
      const result = await availableFunctions[toolName](args);

      const resultAsString =
        typeof result === "object" ? JSON.stringify(result) : result;

      // console.log(`Result from ${toolName}:`, resultAsString);

      // Return result as a string
      return resultAsString;
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      return JSON.stringify({
        error: "An error occurred while executing the tool",
      });
    }
  } else {
    console.error(`Tool ${toolName} not found`);
    return JSON.stringify({ error: "Tool not found" });
  }
};
