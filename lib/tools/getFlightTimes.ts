// lib/tools/getFlightTimes.ts

/**
 * Retrieves the flight times between a departure and arrival city.
 *
 * @param args An object containing the `departure` and `arrival` city codes, or a JSON string that can be parsed into the same object.
 * @returns A stringified JSON object containing the flight details (departure time, arrival time, duration), or an error message if invalid arguments or flight data is provided.
 */
export const getFlightTimes = async (
  args: { departure: string; arrival: string } | string
): Promise<string> => {
  let parsedArgs: { departure: string; arrival: string };

  // Parse arguments if they are provided as a string
  if (typeof args === "string") {
    try {
      parsedArgs = JSON.parse(args) as { departure: string; arrival: string };
    } catch (error) {
      console.error("Error parsing arguments:", error);
      return JSON.stringify({ error: "Invalid arguments format" });
    }
  } else {
    parsedArgs = args;
  }

  const { departure, arrival } = parsedArgs;

  console.log("Getting flight times for:", departure, "to", arrival);

  // Validate if departure or arrival city codes are missing
  if (!departure || !arrival) {
    return JSON.stringify({ error: "Departure or arrival city is missing" });
  }

  // Mock database of flight times
  const flights: Record<
    string,
    { departure: string; arrival: string; duration: string }
  > = {
    "NYC-LAX": {
      departure: "08:00 AM",
      arrival: "11:30 AM",
      duration: "5h 30m",
    },
    "LAX-NYC": {
      departure: "02:00 PM",
      arrival: "10:30 PM",
      duration: "5h 30m",
    },
    "LHR-JFK": {
      departure: "10:00 AM",
      arrival: "01:00 PM",
      duration: "8h 00m",
    },
    "JFK-LHR": {
      departure: "09:00 PM",
      arrival: "09:00 AM",
      duration: "7h 00m",
    },
    "CDG-DXB": {
      departure: "11:00 AM",
      arrival: "08:00 PM",
      duration: "6h 00m",
    },
    "DXB-CDG": {
      departure: "03:00 AM",
      arrival: "07:30 AM",
      duration: "7h 30m",
    },
  };

  // Generate the key for lookup
  const key = `${departure}-${arrival}`.toUpperCase();

  // Retrieve flight details or return an error if not found
  const result = flights[key] || { error: "Flight not found" };

  console.log("Flight time result:", result);

  // Return the result as a JSON string
  return JSON.stringify(result);
};
