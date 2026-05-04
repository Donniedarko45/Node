import { Nodetype } from "@/generated/prisma/enums";
import { LucideIcon } from "lucide-react";

export type NodeCategory = "trigger" | "executor";

export interface NodeConfig {
  type: Nodetype;
  label: string;
  description: string;
  category: NodeCategory;
  icon: LucideIcon;
  color: string;
  requiresCredential?: boolean;
  credentialTypes?: string[];
  defaultData?: Record<string, any>;
}

export interface NodeData {
  label: string;
  [key: string]: any;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// HTTP Request specific data
export interface HttpRequestData extends NodeData {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  headers?: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
}

// AI Model specific data
export interface AIModelData extends NodeData {
  credentialId?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

// Webhook specific data
export interface WebhookData extends NodeData {
  webhookUrl: string;
  message: string;
}

// Trigger specific data
export interface TriggerData extends NodeData {
  triggerType: "manual" | "webhook";
  webhookUrl?: string;
}
