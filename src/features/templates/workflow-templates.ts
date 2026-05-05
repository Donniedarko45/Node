/**
 * Pre-built workflow templates for quick start
 * Perfect for demos and presentations
 */

import { Nodetype } from "@/generated/prisma/enums";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "ai" | "automation" | "notifications" | "data";
  icon: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  nodes: Array<{
    id: string;
    name: string;
    type: Nodetype;
    position: { x: number; y: number };
    data: any;
  }>;
  connections: Array<{
    fromNodeId: string;
    toNodeId: string;
  }>;
  requiredCredentials: string[];
  useCases: string[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "ai-content-generator",
    name: "AI Content Generator",
    description: "Generate blog posts with AI and post to multiple platforms",
    category: "ai",
    icon: "✨",
    difficulty: "beginner",
    estimatedTime: "2 min",
    nodes: [
      {
        id: "trigger-1",
        name: "Manual Start",
        type: Nodetype.MANUAL_TRIGGER,
        position: { x: 100, y: 200 },
        data: {},
      },
      {
        id: "openai-1",
        name: "Generate Blog Post",
        type: Nodetype.OPENAI,
        position: { x: 400, y: 200 },
        data: {
          model: "gpt-4",
          systemPrompt: "You are a professional content writer. Write engaging blog posts.",
          userPrompt: "Write a 500-word blog post about: {{trigger.topic}}",
          temperature: 0.7,
          maxTokens: 1000,
        },
      },
      {
        id: "slack-1",
        name: "Post to Slack",
        type: Nodetype.SLACK,
        position: { x: 700, y: 150 },
        data: {
          webhookUrl: "{{trigger.slackWebhook}}",
          message: "New blog post generated:\n\n{{openai-1.text}}",
        },
      },
      {
        id: "discord-1",
        name: "Post to Discord",
        type: Nodetype.DISCORD,
        position: { x: 700, y: 250 },
        data: {
          webhookUrl: "{{trigger.discordWebhook}}",
          message: "📝 New Content:\n\n{{openai-1.text}}",
        },
      },
    ],
    connections: [
      { fromNodeId: "trigger-1", toNodeId: "openai-1" },
      { fromNodeId: "openai-1", toNodeId: "slack-1" },
      { fromNodeId: "openai-1", toNodeId: "discord-1" },
    ],
    requiredCredentials: ["OpenAI", "Slack", "Discord"],
    useCases: [
      "Content marketing automation",
      "Social media management",
      "Team collaboration",
    ],
  },
  {
    id: "customer-support-ai",
    name: "AI Customer Support",
    description: "Analyze customer inquiries and generate personalized responses",
    category: "ai",
    icon: "🤖",
    difficulty: "intermediate",
    estimatedTime: "3 min",
    nodes: [
      {
        id: "trigger-1",
        name: "New Support Ticket",
        type: Nodetype.MANUAL_TRIGGER,
        position: { x: 100, y: 200 },
        data: {},
      },
      {
        id: "http-1",
        name: "Fetch Customer Data",
        type: Nodetype.HTTP_REQUEST,
        position: { x: 400, y: 200 },
        data: {
          method: "GET",
          url: "https://api.example.com/customers/{{trigger.customerId}}",
          headers: {
            "Authorization": "Bearer {{trigger.apiKey}}",
          },
        },
      },
      {
        id: "anthropic-1",
        name: "Analyze with Claude",
        type: Nodetype.ANTHROPIC,
        position: { x: 700, y: 200 },
        data: {
          model: "claude-3-5-sonnet-20241022",
          systemPrompt: "You are a helpful customer support agent. Analyze the inquiry and provide a professional response.",
          userPrompt: "Customer: {{http-1.data.name}}\nInquiry: {{trigger.inquiry}}\nHistory: {{http-1.data.history}}",
          temperature: 0.5,
          maxTokens: 500,
        },
      },
      {
        id: "http-2",
        name: "Send Response",
        type: Nodetype.HTTP_REQUEST,
        position: { x: 1000, y: 200 },
        data: {
          method: "POST",
          url: "https://api.example.com/tickets/{{trigger.ticketId}}/reply",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            response: "{{anthropic-1.text}}",
            status: "resolved",
          }),
        },
      },
    ],
    connections: [
      { fromNodeId: "trigger-1", toNodeId: "http-1" },
      { fromNodeId: "http-1", toNodeId: "anthropic-1" },
      { fromNodeId: "anthropic-1", toNodeId: "http-2" },
    ],
    requiredCredentials: ["Anthropic"],
    useCases: [
      "Customer support automation",
      "Ticket management",
      "Response generation",
    ],
  },
  {
    id: "data-enrichment",
    name: "Data Enrichment Pipeline",
    description: "Fetch, enrich, and analyze data from multiple sources",
    category: "data",
    icon: "📊",
    difficulty: "advanced",
    estimatedTime: "5 min",
    nodes: [
      {
        id: "trigger-1",
        name: "Webhook Trigger",
        type: Nodetype.GOOGLE_FORM_TRIGGER,
        position: { x: 100, y: 200 },
        data: {},
      },
      {
        id: "http-1",
        name: "Fetch Company Data",
        type: Nodetype.HTTP_REQUEST,
        position: { x: 400, y: 150 },
        data: {
          method: "GET",
          url: "https://api.clearbit.com/v2/companies/find?domain={{trigger.domain}}",
          headers: {
            "Authorization": "Bearer {{trigger.clearbitKey}}",
          },
        },
      },
      {
        id: "http-2",
        name: "Fetch Social Data",
        type: Nodetype.HTTP_REQUEST,
        position: { x: 400, y: 250 },
        data: {
          method: "GET",
          url: "https://api.twitter.com/2/users/by/username/{{trigger.username}}",
          headers: {
            "Authorization": "Bearer {{trigger.twitterKey}}",
          },
        },
      },
      {
        id: "gemini-1",
        name: "Analyze with Gemini",
        type: Nodetype.GEMINI,
        position: { x: 700, y: 200 },
        data: {
          model: "gemini-2.0-flash-exp",
          systemPrompt: "You are a data analyst. Provide insights based on the data.",
          userPrompt: "Company: {{http-1.data}}\nSocial: {{http-2.data}}\n\nProvide a comprehensive analysis.",
          temperature: 0.3,
          maxTokens: 800,
        },
      },
      {
        id: "http-3",
        name: "Save to Database",
        type: Nodetype.HTTP_REQUEST,
        position: { x: 1000, y: 200 },
        data: {
          method: "POST",
          url: "https://api.example.com/leads",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            domain: "{{trigger.domain}}",
            companyData: "{{http-1.data}}",
            socialData: "{{http-2.data}}",
            analysis: "{{gemini-1.text}}",
          }),
        },
      },
    ],
    connections: [
      { fromNodeId: "trigger-1", toNodeId: "http-1" },
      { fromNodeId: "trigger-1", toNodeId: "http-2" },
      { fromNodeId: "http-1", toNodeId: "gemini-1" },
      { fromNodeId: "http-2", toNodeId: "gemini-1" },
      { fromNodeId: "gemini-1", toNodeId: "http-3" },
    ],
    requiredCredentials: ["Gemini"],
    useCases: [
      "Lead enrichment",
      "Market research",
      "Competitive analysis",
    ],
  },
  {
    id: "social-media-monitor",
    name: "Social Media Monitor",
    description: "Monitor mentions and respond with AI-generated replies",
    category: "automation",
    icon: "📱",
    difficulty: "intermediate",
    estimatedTime: "4 min",
    nodes: [
      {
        id: "trigger-1",
        name: "Stripe Payment",
        type: Nodetype.STRIPE_TRIGGER,
        position: { x: 100, y: 200 },
        data: {},
      },
      {
        id: "http-1",
        name: "Fetch User Profile",
        type: Nodetype.HTTP_REQUEST,
        position: { x: 400, y: 200 },
        data: {
          method: "GET",
          url: "https://api.example.com/users/{{trigger.customer.email}}",
        },
      },
      {
        id: "openai-1",
        name: "Generate Thank You",
        type: Nodetype.OPENAI,
        position: { x: 700, y: 200 },
        data: {
          model: "gpt-4",
          systemPrompt: "You are a friendly customer success manager. Write personalized thank you messages.",
          userPrompt: "Customer {{http-1.data.name}} just purchased {{trigger.product}} for ${{trigger.amount}}. Write a warm thank you message.",
          temperature: 0.8,
          maxTokens: 200,
        },
      },
      {
        id: "slack-1",
        name: "Notify Team",
        type: Nodetype.SLACK,
        position: { x: 1000, y: 150 },
        data: {
          webhookUrl: "{{trigger.slackWebhook}}",
          message: "💰 New sale: ${{trigger.amount}} from {{http-1.data.name}}",
        },
      },
      {
        id: "http-2",
        name: "Send Email",
        type: Nodetype.HTTP_REQUEST,
        position: { x: 1000, y: 250 },
        data: {
          method: "POST",
          url: "https://api.sendgrid.com/v3/mail/send",
          headers: {
            "Authorization": "Bearer {{trigger.sendgridKey}}",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: "{{trigger.customer.email}}",
            subject: "Thank you for your purchase!",
            text: "{{openai-1.text}}",
          }),
        },
      },
    ],
    connections: [
      { fromNodeId: "trigger-1", toNodeId: "http-1" },
      { fromNodeId: "http-1", toNodeId: "openai-1" },
      { fromNodeId: "openai-1", toNodeId: "slack-1" },
      { fromNodeId: "openai-1", toNodeId: "http-2" },
    ],
    requiredCredentials: ["OpenAI", "Slack"],
    useCases: [
      "E-commerce automation",
      "Customer engagement",
      "Sales notifications",
    ],
  },
  {
    id: "multi-ai-comparison",
    name: "Multi-AI Comparison",
    description: "Compare responses from OpenAI, Claude, and Gemini",
    category: "ai",
    icon: "🔬",
    difficulty: "beginner",
    estimatedTime: "3 min",
    nodes: [
      {
        id: "trigger-1",
        name: "Start",
        type: Nodetype.MANUAL_TRIGGER,
        position: { x: 100, y: 300 },
        data: {},
      },
      {
        id: "openai-1",
        name: "GPT-4 Response",
        type: Nodetype.OPENAI,
        position: { x: 400, y: 150 },
        data: {
          model: "gpt-4",
          userPrompt: "{{trigger.question}}",
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: "anthropic-1",
        name: "Claude Response",
        type: Nodetype.ANTHROPIC,
        position: { x: 400, y: 300 },
        data: {
          model: "claude-3-5-sonnet-20241022",
          userPrompt: "{{trigger.question}}",
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: "gemini-1",
        name: "Gemini Response",
        type: Nodetype.GEMINI,
        position: { x: 400, y: 450 },
        data: {
          model: "gemini-2.0-flash-exp",
          userPrompt: "{{trigger.question}}",
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: "discord-1",
        name: "Post Comparison",
        type: Nodetype.DISCORD,
        position: { x: 700, y: 300 },
        data: {
          webhookUrl: "{{trigger.webhookUrl}}",
          message: "🤖 AI Comparison Results:\n\n**GPT-4:**\n{{openai-1.text}}\n\n**Claude:**\n{{anthropic-1.text}}\n\n**Gemini:**\n{{gemini-1.text}}",
        },
      },
    ],
    connections: [
      { fromNodeId: "trigger-1", toNodeId: "openai-1" },
      { fromNodeId: "trigger-1", toNodeId: "anthropic-1" },
      { fromNodeId: "trigger-1", toNodeId: "gemini-1" },
      { fromNodeId: "openai-1", toNodeId: "discord-1" },
      { fromNodeId: "anthropic-1", toNodeId: "discord-1" },
      { fromNodeId: "gemini-1", toNodeId: "discord-1" },
    ],
    requiredCredentials: ["OpenAI", "Anthropic", "Gemini", "Discord"],
    useCases: [
      "AI model comparison",
      "Quality assurance",
      "Research and development",
    ],
  },
];

export function getTemplatesByCategory(category: string) {
  return WORKFLOW_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string) {
  return WORKFLOW_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByDifficulty(difficulty: string) {
  return WORKFLOW_TEMPLATES.filter((t) => t.difficulty === difficulty);
}
