"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { nodeTypes } from "@/features/nodes/components/node-types";
import { NodeSelector } from "@/features/nodes/components/node-selector";
import { NodeSettings } from "@/features/nodes/components/node-settings";
import { NodeConfig } from "@/features/nodes/types";
import { Nodetype } from "@/generated/prisma/enums";
import { getNodeConfig } from "@/features/nodes/node-configs";

export const EditorLoading = () => {
  return <LoadingView message="loading editor" />;
};

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />;
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Initialize nodes and edges from database
  useEffect(() => {
    if (workflow) {
      // Convert database nodes to React Flow nodes
      const flowNodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type.toLowerCase(),
        position: node.position as { x: number; y: number },
        data: {
          label: node.name,
          ...((node.data as object) || {}),
        },
      }));

      // Convert database connections to React Flow edges
      const flowEdges: Edge[] = workflow.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [workflow]);

  // Listen for node settings event
  useEffect(() => {
    const handleOpenSettings = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { nodeId } = customEvent.detail;
      setSelectedNodeId(nodeId);
      setSettingsOpen(true);
    };

    window.addEventListener("openNodeSettings", handleOpenSettings);
    return () => {
      window.removeEventListener("openNodeSettings", handleOpenSettings);
    };
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  // Add new node
  const handleAddNode = useCallback(
    (nodeConfig: NodeConfig) => {
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: nodeConfig.type.toLowerCase(),
        position: {
          x: Math.random() * 400,
          y: Math.random() * 400,
        },
        data: {
          label: nodeConfig.label,
          ...nodeConfig.defaultData,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [],
  );

  // Save node settings
  const handleSaveSettings = useCallback(
    (nodeId: string, data: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
        )
      );
    },
    [],
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedNodeType = selectedNode?.type
    ? (selectedNode.type.toUpperCase() as Nodetype)
    : null;

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap />

        {/* Add Node Button */}
        <Panel position="top-right" className="space-x-2">
          <NodeSelector onSelectNode={handleAddNode} />
        </Panel>
      </ReactFlow>

      {/* Node Settings Panel */}
      <NodeSettings
        nodeId={selectedNodeId}
        nodeType={selectedNodeType}
        nodeData={selectedNode?.data || {}}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSave={handleSaveSettings}
      />
    </div>
  );
};
