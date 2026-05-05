/**
 * Production-ready workflow execution engine
 * Handles node execution with retry logic, timeouts, and error handling
 */

import { prisma } from "@/lib/db";
import { ExecutionStatus, Nodetype } from "@/generated/prisma/enums";
import { buildDependencyGraph, topologicalSort } from "@/lib/toposort";
import { resolveObjectTemplates, type ExecutionContext, validateTemplate } from "@/lib/templating";
import { executeHttpRequest } from "@/features/executors/http-executor";
import { executeAIModel } from "@/features/executors/ai-executor";
import { executeWebhook } from "@/features/executors/webhook-executor";
import Cryptr from "cryptr";

const cryptr = new Cryptr(process.env.ENCRYPTION_KEY || "default-secret-key");

export interface ExecutionConfig {
  workflowId: string;
  userId: string;
  triggerData?: any;
  timeout?: number; // milliseconds
  retryAttempts?: number;
  retryDelay?: number; // milliseconds
}

export interface NodeExecutionResult {
  nodeId: string;
  nodeName: string;
  status: "success" | "failed" | "skipped";
  output?: any;
  error?: string;
  duration: number;
  retries: number;
}

export interface ExecutionResult {
  executionId: string;
  status: ExecutionStatus;
  output?: ExecutionContext;
  error?: string;
  nodeResults: NodeExecutionResult[];
  totalDuration: number;
}

export class ExecutionError extends Error {
  constructor(
    message: string,
    public nodeId?: string,
    public nodeName?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "ExecutionError";
  }
}

export class ExecutionTimeoutError extends ExecutionError {
  constructor(message: string, nodeId?: string, nodeName?: string) {
    super(message, nodeId, nodeName);
    this.name = "ExecutionTimeoutError";
  }
}

/**
 * Validates workflow before execution
 */
async function validateWorkflow(workflowId: string, userId: string) {
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
    include: {
      nodes: {
        include: { credential: true },
      },
      connections: true,
    },
  });

  if (!workflow) {
    throw new ExecutionError("Workflow not found or unauthorized");
  }

  // Check if workflow has nodes
  if (workflow.nodes.length === 0) {
    throw new ExecutionError("Workflow has no nodes");
  }

  // Check for required credentials
  for (const node of workflow.nodes) {
    const requiresCredential = [
      Nodetype.OPENAI,
      Nodetype.ANTHROPIC,
      Nodetype.GEMINI,
      Nodetype.DISCORD,
      Nodetype.SLACK,
    ].includes(node.type);

    if (requiresCredential && !node.credentialId) {
      throw new ExecutionError(
        `Node "${node.name}" requires a credential but none is configured`,
        node.id,
        node.name
      );
    }
  }

  return workflow;
}

/**
 * Executes a single node with retry logic
 */
async function executeNode(
  node: any,
  context: ExecutionContext,
  retryAttempts: number = 3,
  retryDelay: number = 1000
): Promise<{ output: any; retries: number }> {
  let lastError: Error | null = null;
  let retries = 0;

  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      // Resolve templates in node data
      const resolvedData = resolveObjectTemplates(node.data, context);

      let output: any;

      switch (node.type) {
        case Nodetype.INITIAL:
        case Nodetype.MANUAL_TRIGGER:
        case Nodetype.GOOGLE_FORM_TRIGGER:
        case Nodetype.STRIPE_TRIGGER:
          // Trigger nodes pass through trigger data
          output = context.trigger || {};
          break;

        case Nodetype.HTTP_REQUEST:
          output = await executeHttpRequest({
            method: resolvedData.method || "GET",
            url: resolvedData.url,
            headers: resolvedData.headers,
            body: resolvedData.body,
            queryParams: resolvedData.queryParams,
          });
          break;

        case Nodetype.OPENAI:
        case Nodetype.ANTHROPIC:
        case Nodetype.GEMINI:
          if (!node.credential) {
            throw new Error(`Node requires a credential`);
          }

          const decryptedKey = cryptr.decrypt(node.credential.value);

          output = await executeAIModel({
            provider: node.type.toLowerCase() as any,
            model: resolvedData.model,
            apiKey: decryptedKey,
            systemPrompt: resolvedData.systemPrompt,
            userPrompt: resolvedData.userPrompt,
            temperature: resolvedData.temperature,
            maxTokens: resolvedData.maxTokens,
          });
          break;

        case Nodetype.DISCORD:
        case Nodetype.SLACK:
          output = await executeWebhook({
            webhookUrl: resolvedData.webhookUrl,
            message: resolvedData.message,
            provider: node.type.toLowerCase() as any,
          });
          break;

        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }

      return { output, retries };
    } catch (error: any) {
      lastError = error;
      retries = attempt;

      // Don't retry on certain errors
      const nonRetryableErrors = [
        "unauthorized",
        "forbidden",
        "invalid",
        "not found",
        "credential",
      ];

      const shouldNotRetry = nonRetryableErrors.some((keyword) =>
        error.message.toLowerCase().includes(keyword)
      );

      if (shouldNotRetry || attempt === retryAttempts) {
        throw new ExecutionError(
          `Node execution failed: ${error.message}`,
          node.id,
          node.name,
          error
        );
      }

      // Wait before retry with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * Math.pow(2, attempt))
      );
    }
  }

  throw lastError || new Error("Unknown error");
}

/**
 * Executes workflow with timeout
 */
async function executeWithTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  errorMessage: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new ExecutionTimeoutError(errorMessage));
    }, timeout);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Main execution function
 */
export async function executeWorkflow(
  config: ExecutionConfig
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const {
    workflowId,
    userId,
    triggerData = {},
    timeout = 300000, // 5 minutes default
    retryAttempts = 3,
    retryDelay = 1000,
  } = config;

  const nodeResults: NodeExecutionResult[] = [];

  // Create execution record
  const execution = await prisma.execution.create({
    data: {
      workflowId,
      status: ExecutionStatus.RUNNING,
    },
  });

  try {
    // Validate workflow
    const workflow = await validateWorkflow(workflowId, userId);

    // Build execution order
    const graph = buildDependencyGraph(workflow.nodes, workflow.connections);
    const executionOrder = topologicalSort(graph);

    // Initialize context
    const context: ExecutionContext = {
      trigger: triggerData,
      workflow: {
        id: workflow.id,
        name: workflow.name,
      },
      execution: {
        id: execution.id,
        startedAt: new Date(),
      },
    };

    // Execute nodes in order with timeout
    await executeWithTimeout(
      (async () => {
        for (const nodeId of executionOrder) {
          const node = workflow.nodes.find((n) => n.id === nodeId);
          if (!node) continue;

          const nodeStartTime = Date.now();

          try {
            const { output, retries } = await executeNode(
              node,
              context,
              retryAttempts,
              retryDelay
            );

            // Store output in context
            context[node.id] = output;
            context[node.name] = output;

            nodeResults.push({
              nodeId: node.id,
              nodeName: node.name,
              status: "success",
              output,
              duration: Date.now() - nodeStartTime,
              retries,
            });
          } catch (error: any) {
            nodeResults.push({
              nodeId: node.id,
              nodeName: node.name,
              status: "failed",
              error: error.message,
              duration: Date.now() - nodeStartTime,
              retries: error.retries || 0,
            });

            throw error;
          }
        }
      })(),
      timeout,
      `Workflow execution exceeded timeout of ${timeout}ms`
    );

    // Mark as successful
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: ExecutionStatus.SUCCESS,
        output: context,
        completedAt: new Date(),
      },
    });

    return {
      executionId: execution.id,
      status: ExecutionStatus.SUCCESS,
      output: context,
      nodeResults,
      totalDuration: Date.now() - startTime,
    };
  } catch (error: any) {
    // Mark as failed
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: ExecutionStatus.FAILED,
        errorStack: {
          message: error.message,
          name: error.name,
          stack: error.stack,
          nodeId: error.nodeId,
          nodeName: error.nodeName,
          nodeResults,
        },
        completedAt: new Date(),
      },
    });

    return {
      executionId: execution.id,
      status: ExecutionStatus.FAILED,
      error: error.message,
      nodeResults,
      totalDuration: Date.now() - startTime,
    };
  }
}
