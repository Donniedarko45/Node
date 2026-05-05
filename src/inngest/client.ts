import { Inngest } from "inngest";

// Create a client to send and receive events
// For development, we'll use a simpler approach
export const inngest = new Inngest({ 
  id: "nodebase",
  // Only set eventKey if it exists and is not a placeholder
  ...(process.env.INNGEST_EVENT_KEY && 
      process.env.INNGEST_EVENT_KEY !== "test" && 
      process.env.INNGEST_EVENT_KEY !== "your-inngest-event-key" 
      ? { eventKey: process.env.INNGEST_EVENT_KEY } 
      : {}),
});