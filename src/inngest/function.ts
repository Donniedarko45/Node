import { inngest } from "./client";
import { prisma } from "@/lib/db";
import { Nodetype, ExecutionStatus } from "@/generated/prisma/enums";
import { buildDependencyGraph, topologicalSort } from "@/lib/toposort";
import { resolveObjectTemplates, type ExecutionContext } from "@/lib/templating";
import { executeHttpRequest } from "@/features/executors/http-executor";
import { executeAIModel } from "@/features/executors/ai-executor";
import { executeWebhook } from "@/features/executors/webhook-executor";
import Cryptr from "cryptr";

const cryptr = new Cryptr(process.env.ENCRYPTION_KEY || "default-secret-key");

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflow/execute" },
  async ({ event, step }) => {
    const { workflowId, triggerData = {} } = event.data;

    // Create execution record
    const execution = await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          status: ExecutionStatus.RUNNING,
        },
      });
    });

    try {
      // Fetch workflow with nodes and connections
      const workflow = await step.run("fetch-workflow", async () => {
        return prisma.workflow.findUniqueOrThrow({
          where: { id: workflowId },
          include: {
            nodes: {
              include: {
                credential: true,
              },
            },
            connections: true,
          },
        });
      });

      // Build execution order using topological sort
      const executionOrder = await step.run("build-execution-order", async () => {
        const graph = buildDependencyGraph(workflow.nodes, workflow.connections);
        return topologicalSort(graph);
      });

      // Initialize execution context
      const context: ExecutionContext = {
        trigger: triggerData,
      };

      // Execute nodes in order
      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find((n) => n.id === nodeId);
        if (!node) continue;

        await step.run(`execute-node-${nodeId}`, async () => {
          try {
            // Resolve templates in node data
            const resolvedData = resolveObjectTemplates(node.data, context);

            let output: any;

            switch (node.type) {
              case Nodetype.INITIAL:
              case Nodetype.MANUAL_TRIGGER:
                // Trigger nodes just pass through trigger data
                output = triggerData;
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
                  throw new Error(`Node ${node.name} requires a credential`);
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
                output = await executeWebhook({
                  webhookUrl: resolvedData.webhookUrl,
                  message: resolvedData.message,
                  provider: "discord",
                });
                break;

              case Nodetype.SLACK:
                output = await executeWebhook({
                  webhookUrl: resolvedData.webhookUrl,
                  message: resolvedData.message,
                  provider: "slack",
                });
                break;

              default:
                throw new Error(`Unsupported node type: ${node.type}`);
            }

            // Store output in context for next nodes
            context[node.id] = output;
            context[node.name] = output; // Also allow access by name

            return output;
          } catch (error: any) {
            throw new Error(`Node ${node.name} failed: ${error.message}`);
          }
        });
      }

      // Mark execution as successful
      await step.run("mark-success", async () => {
        return prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: ExecutionStatus.SUCCESS,
            output: context,
            completedAt: new Date(),
          },
        });
      });

      return { success: true, executionId: execution.id, output: context };
    } catch (error: any) {
      // Mark execution as failed
      await step.run("mark-failed", async () => {
        return prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: ExecutionStatus.FAILED,
            errorStack: error.stack || error.message,
            completedAt: new Date(),
          },
        });
      });

      throw error;
    }
  }
);

export const functions = [executeWorkflow];
