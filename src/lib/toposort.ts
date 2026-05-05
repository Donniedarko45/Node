/**
 * Topological sort for workflow nodes
 * Ensures nodes are executed in the correct order based on their dependencies
 */

interface GraphNode {
  id: string;
  dependencies: string[];
}

export class TopologicalSortError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TopologicalSortError";
  }
}

/**
 * Performs topological sort on workflow nodes
 * @param nodes - Array of nodes with their dependencies
 * @returns Sorted array of node IDs in execution order
 * @throws TopologicalSortError if circular dependency detected
 */
export function topologicalSort(nodes: GraphNode[]): string[] {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  // Create adjacency map
  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach((node) => nodeMap.set(node.id, node));

  function visit(nodeId: string) {
    if (visited.has(nodeId)) return;

    if (visiting.has(nodeId)) {
      throw new TopologicalSortError(
        `Circular dependency detected involving node: ${nodeId}`
      );
    }

    visiting.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (node) {
      // Visit all dependencies first
      for (const depId of node.dependencies) {
        visit(depId);
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    sorted.push(nodeId);
  }

  // Visit all nodes
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      visit(node.id);
    }
  }

  return sorted;
}

/**
 * Builds dependency graph from workflow connections
 */
export function buildDependencyGraph(
  nodes: Array<{ id: string }>,
  connections: Array<{ fromNodeId: string; toNodeId: string }>
): GraphNode[] {
  const dependencyMap = new Map<string, Set<string>>();

  // Initialize all nodes
  nodes.forEach((node) => {
    dependencyMap.set(node.id, new Set());
  });

  // Build dependencies (reverse of connections)
  connections.forEach((conn) => {
    const deps = dependencyMap.get(conn.toNodeId);
    if (deps) {
      deps.add(conn.fromNodeId);
    }
  });

  // Convert to GraphNode array
  return Array.from(dependencyMap.entries()).map(([id, deps]) => ({
    id,
    dependencies: Array.from(deps),
  }));
}
