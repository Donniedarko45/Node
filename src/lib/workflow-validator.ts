/**
 * Workflow validation utilities
 * Validates workflow structure before execution
 */

import { Nodetype } from "@/generated/prisma/enums";

export interface ValidationError {
  type: "error" | "warning";
  message: string;
  nodeId?: string;
  nodeName?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validates workflow structure
 */
export function validateWorkflowStructure(
  nodes: Array<{ id: string; name: string; type: Nodetype; data: any; credentialId?: string | null }>,
  connections: Array<{ fromNodeId: string; toNodeId: string }>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check if workflow has nodes
  if (nodes.length === 0) {
    errors.push({
      type: "error",
      message: "Workflow must have at least one node",
    });
    return { valid: false, errors, warnings };
  }

  // Check for trigger nodes
  const triggerNodes = nodes.filter((n) =>
    [
      Nodetype.INITIAL,
      Nodetype.MANUAL_TRIGGER,
      Nodetype.GOOGLE_FORM_TRIGGER,
      Nodetype.STRIPE_TRIGGER,
    ].includes(n.type)
  );

  if (triggerNodes.length === 0) {
    errors.push({
      type: "error",
      message: "Workflow must have at least one trigger node",
    });
  }

  if (triggerNodes.length > 1) {
    warnings.push({
      type: "warning",
      message: "Workflow has multiple trigger nodes. Only the first in execution order will be used.",
    });
  }

  // Check for orphaned nodes (nodes with no connections)
  if (nodes.length > 1) {
    const connectedNodeIds = new Set<string>();
    connections.forEach((conn) => {
      connectedNodeIds.add(conn.fromNodeId);
      connectedNodeIds.add(conn.toNodeId);
    });

    const orphanedNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));
    orphanedNodes.forEach((node) => {
      warnings.push({
        type: "warning",
        message: `Node "${node.name}" is not connected to any other nodes`,
        nodeId: node.id,
        nodeName: node.name,
      });
    });
  }

  // Check for circular dependencies
  try {
    detectCircularDependencies(nodes, connections);
  } catch (error: any) {
    errors.push({
      type: "error",
      message: error.message,
    });
  }

  // Validate individual nodes
  nodes.forEach((node) => {
    const nodeErrors = validateNode(node);
    errors.push(...nodeErrors);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates individual node configuration
 */
function validateNode(node: {
  id: string;
  name: string;
  type: Nodetype;
  data: any;
  credentialId?: string | null;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if node has a name
  if (!node.name || node.name.trim() === "") {
    errors.push({
      type: "error",
      message: "Node must have a name",
      nodeId: node.id,
    });
  }

  // Check for required credentials
  const requiresCredential = [
    Nodetype.OPENAI,
    Nodetype.ANTHROPIC,
    Nodetype.GEMINI,
    Nodetype.DISCORD,
    Nodetype.SLACK,
  ].includes(node.type);

  if (requiresCredential && !node.credentialId) {
    errors.push({
      type: "error",
      message: `Node "${node.name}" requires a credential`,
      nodeId: node.id,
      nodeName: node.name,
    });
  }

  // Validate node-specific configuration
  switch (node.type) {
    case Nodetype.HTTP_REQUEST:
      if (!node.data.url) {
        errors.push({
          type: "error",
          message: `HTTP Request node "${node.name}" requires a URL`,
          nodeId: node.id,
          nodeName: node.name,
        });
      }
      break;

    case Nodetype.OPENAI:
    case Nodetype.ANTHROPIC:
    case Nodetype.GEMINI:
      if (!node.data.model) {
        errors.push({
          type: "error",
          message: `AI node "${node.name}" requires a model`,
          nodeId: node.id,
          nodeName: node.name,
        });
      }
      if (!node.data.userPrompt) {
        errors.push({
          type: "error",
          message: `AI node "${node.name}" requires a user prompt`,
          nodeId: node.id,
          nodeName: node.name,
        });
      }
      break;

    case Nodetype.DISCORD:
    case Nodetype.SLACK:
      if (!node.data.webhookUrl) {
        errors.push({
          type: "error",
          message: `Webhook node "${node.name}" requires a webhook URL`,
          nodeId: node.id,
          nodeName: node.name,
        });
      }
      if (!node.data.message) {
        errors.push({
          type: "error",
          message: `Webhook node "${node.name}" requires a message`,
          nodeId: node.id,
          nodeName: node.name,
        });
      }
      break;
  }

  return errors;
}

/**
 * Detects circular dependencies in workflow
 */
function detectCircularDependencies(
  nodes: Array<{ id: string }>,
  connections: Array<{ fromNodeId: string; toNodeId: string }>
): void {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  // Build adjacency list
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach((node) => adjacencyList.set(node.id, []));
  connections.forEach((conn) => {
    const neighbors = adjacencyList.get(conn.fromNodeId) || [];
    neighbors.push(conn.toNodeId);
    adjacencyList.set(conn.fromNodeId, neighbors);
  });

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        throw new Error(
          `Circular dependency detected in workflow. Node "${nodeId}" creates a cycle.`
        );
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  }
}
