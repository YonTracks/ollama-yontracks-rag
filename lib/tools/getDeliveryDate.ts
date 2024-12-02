/**
 * Get the delivery date for a customer's order.
 * @param args - Arguments containing the order ID.
 * @returns The estimated delivery date for the order.
 */
export const getDeliveryDate = async (args: { orderId: string } | string) => {
  let parsedArgs: { orderId: string };

  // Check if args is a string and parse it
  if (typeof args === "string") {
    try {
      parsedArgs = JSON.parse(args);
    } catch (error) {
      console.error("Error parsing arguments:", error);
      return JSON.stringify({ error: "Invalid arguments format" });
    }
  } else {
    parsedArgs = args;
  }

  const { orderId } = parsedArgs;

  console.log("Getting delivery date for order order_id:", orderId);

  // Normalize the order_id
  let normalizedOrderId = orderId.toUpperCase();

  // If the order_id does not have the prefix 'ORDER', add it
  if (!normalizedOrderId.startsWith("ORDER")) {
    normalizedOrderId = `ORDER${normalizedOrderId}`;
  }

  const deliveryDates: {
    [key: string]: { order_id: string; delivery_date: string };
  } = {
    ORDER123: {
      order_id: "ORDER123",
      delivery_date: "2024-09-20",
    },
    ORDER456: {
      order_id: "ORDER456",
      delivery_date: "2024-09-22",
    },
    ORDER789: {
      order_id: "ORDER789",
      delivery_date: "2024-09-25",
    },
  };

  // Get the delivery date for the given order ID
  const result = deliveryDates[normalizedOrderId] || {
    error: "Order not found",
  };

  console.log("Delivery date result:", result);

  return JSON.stringify(result);
};
