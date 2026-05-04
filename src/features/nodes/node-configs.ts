import { Nodetype } from "@/generated/prisma/enums";
import {
  PlayIcon,
  WebhookIcon,
  GlobeIcon,
  BrainIcon,
  SparklesIcon,
  BotIcon,
  MessageSquareIcon,
  HashIcon,
  CreditCardIcon,
} from "lucide-react";
import { NodeConfig } from "./types";

export const NODE_CONFIGS: Record<Nodetype, NodeConfig> = {
  [Nodetype.INITIAL]: {
    type: Nodetype.INITIAL,
    label: "Start",
    description: "Initial node for workflow",
    category: "trigger",
    icon: PlayIcon,
    color: "bg-slate-500",
    defaultData: {},
  },

  [Nodetype.MANUAL_TRIGGER]: {
    type: Nodetype.MANUAL_TRIGGER,
    label: "Manual Trigger",
    description: "Manually trigger workflow execution",
    category: "trigger",
    icon: PlayIcon,
    color: "bg-blue-500",
    defaultData: {
      triggerType: "manual",
    },
  },

  [Nodetype.GOOGLE_FORM_TRIGGER]: {
    type: Nodetype.GOOGLE_FORM_TRIGGER,
    label: "Google Forms",
    description: "Trigger on Google Form submission",
    category: "trigger",
    icon: HashIcon,
    color: "bg-green-500",
    defaultData: {
      triggerType: "webhook",
    },
  },

  [Nodetype.STRIPE_TRIGGER]: {
    type: Nodetype.STRIPE_TRIGGER,
    label: "Stripe",
    description: "Trigger on Stripe events",
    category: "trigger",
    icon: CreditCardIcon,
    color: "bg-purple-500",
    defaultData: {
      triggerType: "webhook",
    },
  },

  [Nodetype.HTTP_REQUEST]: {
    type: Nodetype.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Make HTTP API calls",
    category: "executor",
    icon: GlobeIcon,
    color: "bg-orange-500",
    defaultData: {
      method: "GET",
      url: "",
      headers: {},
      body: "",
    },
  },

  [Nodetype.OPENAI]: {
    type: Nodetype.OPENAI,
    label: "OpenAI",
    description: "Use OpenAI models (GPT-4, etc.)",
    category: "executor",
    icon: BrainIcon,
    color: "bg-emerald-500",
    requiresCredential: true,
    credentialTypes: ["OPENAI"],
    defaultData: {
      model: "gpt-4",
      systemPrompt: "",
      userPrompt: "",
      temperature: 0.7,
      maxTokens: 1000,
    },
  },

  [Nodetype.ANTHROPIC]: {
    type: Nodetype.ANTHROPIC,
    label: "Anthropic",
    description: "Use Claude models",
    category: "executor",
    icon: SparklesIcon,
    color: "bg-amber-500",
    requiresCredential: true,
    credentialTypes: ["ANTHROPIC"],
    defaultData: {
      model: "claude-3-5-sonnet-20241022",
      systemPrompt: "",
      userPrompt: "",
      temperature: 0.7,
      maxTokens: 1000,
    },
  },

  [Nodetype.GEMINI]: {
    type: Nodetype.GEMINI,
    label: "Gemini",
    description: "Use Google Gemini models",
    category: "executor",
    icon: SparklesIcon,
    color: "bg-blue-600",
    requiresCredential: true,
    credentialTypes: ["GEMINI"],
    defaultData: {
      model: "gemini-2.0-flash-exp",
      systemPrompt: "",
      userPrompt: "",
      temperature: 0.7,
      maxTokens: 1000,
    },
  },

  [Nodetype.DISCORD]: {
    type: Nodetype.DISCORD,
    label: "Discord",
    description: "Send messages to Discord",
    category: "executor",
    icon: MessageSquareIcon,
    color: "bg-indigo-500",
    requiresCredential: true,
    credentialTypes: ["DISCORD"],
    defaultData: {
      webhookUrl: "",
      message: "",
    },
  },

  [Nodetype.SLACK]: {
    type: Nodetype.SLACK,
    label: "Slack",
    description: "Send messages to Slack",
    category: "executor",
    icon: HashIcon,
    color: "bg-pink-500",
    requiresCredential: true,
    credentialTypes: ["SLACK"],
    defaultData: {
      webhookUrl: "",
      message: "",
    },
  },
};

export const TRIGGER_NODES = Object.values(NODE_CONFIGS).filter(
  (config) => config.category === "trigger" && config.type !== Nodetype.INITIAL
);

export const EXECUTOR_NODES = Object.values(NODE_CONFIGS).filter(
  (config) => config.category === "executor"
);

export const getNodeConfig = (type: Nodetype): NodeConfig => {
  return NODE_CONFIGS[type];
};
