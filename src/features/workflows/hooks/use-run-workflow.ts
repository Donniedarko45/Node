"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface RunWorkflowOptions {
  workflowId: string;
  triggerData?: any;
  timeout?: number;
  retryAttempts?: number;
}

export interface RunWorkflowResult {
  success: boolean;
  executionId: string;
  output?: any;
  error?: string;
  nodeResults?: Array<{
    nodeId: string;
    nodeName: string;
    status: string;
    duration: number;
  }>;
  duration?: number;
}

export const useRunWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: RunWorkflowOptions): Promise<RunWorkflowResult> => {
      const { workflowId, triggerData = {}, timeout, retryAttempts } = options;

      // Show loading toast
      const loadingToast = toast.loading("Starting workflow execution...");

      try {
        const response = await fetch(`/api/workflows/${workflowId}/execute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            triggerData,
            timeout,
            retryAttempts,
          }),
        });

        const result = await response.json();

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to execute workflow");
        }

        // Show success toast with duration
        const durationText = result.duration 
          ? ` (${(result.duration / 1000).toFixed(2)}s)`
          : "";
        toast.success(`Workflow executed successfully${durationText}`);

        return {
          success: true,
          executionId: result.executionId,
          output: result.output,
          nodeResults: result.nodeResults,
          duration: result.duration,
        };
      } catch (error: any) {
        // Dismiss loading toast
        toast.dismiss(loadingToast);

        // Show error toast
        toast.error(`Workflow execution failed: ${error.message}`);

        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate executions queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["executions"] });
      
      // Optionally navigate to execution detail
      if (data.executionId) {
        queryClient.invalidateQueries({ 
          queryKey: ["executions", "getOne", { id: data.executionId }] 
        });
      }
    },
    onError: (error: any) => {
      console.error("Workflow execution error:", error);
    },
  });
};
