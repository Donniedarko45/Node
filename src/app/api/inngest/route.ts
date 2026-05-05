import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { functions } from "@/inngest/function";

// Create an API that serves workflow execution functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});