import { NodeProps } from "@xyflow/react";
import { BaseNode, BaseNodeData } from "./base-node";
import { Nodetype } from "@/generated/prisma/enums";

// Create specific node components for each type
export const InitialNode = (props: NodeProps) => (
  <BaseNode {...props} data={props.data as BaseNodeData} nodeType={Nodetype.INITIAL} />
);

export const ManualTriggerNode = (props: NodeProps) => (
  <BaseNode {...props} data={props.data as BaseNodeData} nodeType={Nodetype.MANUAL_TRIGGER} />
);

export const GoogleFormTriggerNode = (props: NodeProps) => (
  <BaseNode {...props} data={props.data as BaseNodeData} nodeType={Nodetype.GOOGLE_FORM_TRIGGER} />
);

export const StripeTriggerNode = (props: NodeProps) => (
  <BaseNode {...props} data={props.data as BaseNodeData} nodeType={Nodetype.STRIPE_TRIGGER} />
);

export const HttpRequestNode = (props: NodeProps) => (
  <BaseNode {...props} data={props.data as BaseNodeData} nodeType={Nodetype.HTTP_REQUEST} />
);

export const OpenAINode = (props: NodeProps) => (
  <BaseNode {...props} data={props.data as BaseNodeData} nodeType={Nodetype.OPENAI} />
);

export const AnthropicNode = (props: NodeProps) => (
  <BaseNode {...props} data={props.data as BaseNodeData} nodeType={Nodetype.ANTHROPIC} />
);

export const GeminiNode = (props: NodeProps) => (
  <BaseNode {...props} data={props.data as BaseNodeData} nodeType={Nodetype.GEMINI} />
);

export const DiscordNode = (props: NodeProps) => (
  <BaseNode {...props} data={props.data as BaseNodeData} nodeType={Nodetype.DISCORD} />
);

export const SlackNode = (props: NodeProps) => (
  <BaseNode {...props} data={props.data as BaseNodeData} nodeType={Nodetype.SLACK} />
);

// Export node types map for React Flow
export const nodeTypes = {
  initial: InitialNode,
  manual_trigger: ManualTriggerNode,
  google_form_trigger: GoogleFormTriggerNode,
  stripe_trigger: StripeTriggerNode,
  http_request: HttpRequestNode,
  openai: OpenAINode,
  anthropic: AnthropicNode,
  gemini: GeminiNode,
  discord: DiscordNode,
  slack: SlackNode,
};
