Project Context Document: Autoflux (Automation SaaS)
1. Project Overview
Autoflux is a production-ready workflow automation platform (an N8N / Zapier clone). It allows users to build, execute, and monitor automated workflows via a visual drag-and-drop canvas. It features a complete SaaS layer including authentication, subscription paywalls, encrypted credentials management, and real-time background execution tracking.

2. Tech Stack & Dependencies
Framework: Next.js 15 (App Router, Server/Client Components).

Styling & UI: Tailwind CSS v4, shadcn/ui, TweakCN (for theming).

Database & ORM: PostgreSQL (via Neon DB), Prisma ORM.

Data Access Layer: tRPC combined with TanStack React Query (fetching server-side and rehydrating client-side).

Authentication: Better Auth (Email/Password, Google, GitHub OAuth).

Payments & Subscriptions: Polar.sh (Customer sync, webhooks, paywalling).

Background Jobs & Real-Time Events: Inngest & Inngest Realtime (WebSockets).

Visual Editor (Canvas): React Flow (@xyflow/react).

AI Integrations: Vercel AI SDK (Google Gemini, OpenAI, Anthropic).

Error Tracking & Analytics: Sentry (Next.js SDK, LLM Monitoring, Session Replays).

Utilities: nuqs (URL state management), handlebars (string/JSON templating), ky (lightweight HTTP requests), cuid2 (ID generation), date-fns (time formatting), cryptr (credential encryption), superjson (data serialization).

3. Database Schema Entities
User / Session / Account: Standard Better Auth tables.

Workflow: Stores id, name, userId (foreign key), and cascade deletes.

Node: Stores id, workflowId, type (e.g., INITIAL, MANUAL_TRIGGER, HTTP_REQUEST, GOOGLE_FORM_TRIGGER, STRIPE_TRIGGER, OPENAI, GEMINI, ANTHROPIC, DISCORD, SLACK), position (X/Y coordinates), data (JSON configuration), and an optional credentialId.

Connection (Edges): Stores id, workflowId, fromNodeId, toNodeId, fromOutput, toInput.

Execution: Stores id, workflowId, inngestEventId, status (RUNNING, SUCCESS, FAILED), timestamps (startedAt, completedAt), and JSON output/errorStack.

Credential: Stores id, userId, name, type, and value (encrypted API keys).

4. Core Architecture & Patterns
Domain-Driven Features: The src/features folder is split by domain (auth, workflows, editor, executions, credentials, triggers). Each contains its own components, hooks, server (TRPC routers), and lib.

TRPC Protected Procedures: Security is enforced at the Data Access Layer.

protectedProcedure: Validates Better Auth session.

premiumProcedure: Extends protectedProcedure by calling Polar to verify active subscriptions.

Hybrid Data Fetching: Data is prefetched on the server (using TRPC's server caller and HydrationBoundary) and consumed on the client using useSuspenseQuery for instantaneous loads and cache reactiveness.

Topological Sort: Workflows branch out. A utility (toposort) sorts React Flow nodes topologically before execution so dependencies are resolved in the right order.

Bring Your Own Key (BYOK): Users provide their own AI API keys via the "Credentials" tab. These are encrypted using cryptr before saving and decrypted at runtime during the Inngest execution step.

5. Part 1 Features (Foundation)
Bootstrapping: Next.js, Tailwind v4, and Shadcn UI configurations.

Database Setup: Prisma initialization connected to Neon.

TRPC Integration: Setting up the tRPC router, tRPC contexts, server callers, and wrapping the app in TRPCReactProvider.

Better Auth Setup: Implementing sign-up/login pages, secure server routes via requireAuth utils, and handling user sessions.

Inngest Background Jobs: Creating standard Inngest endpoints (/api/inngest) for long-running workflows.

Sentry Monitoring: Linking standard frontend/backend errors and LLM token usage (costs, durations, model types).

6. Part 2 Features (Engine & Integrations)
Dashboard & Layouts: Next.js Route Groups ((dashboard)), reusable sidebar (app-sidebar.tsx) handling navigation, active states, and user logouts.

Polar Integration: Validating customer tier dynamically and upgrading via a Polar checkout link. Paywalling the createWorkflow and createCredential actions.

Workflow CRUD & Pagination: Using nuqs for URL-synced state (debounced search, page sizes, paginations).

React Flow Editor:

Synchronizing the database Node and Connection models to React Flow's canvas state.

NodeSelector: A sidebar sheet to spawn new trigger or execution nodes.

Base components: BaseTriggerNode and BaseExecutionNode handle standard UI (delete, settings, status dots).

Templating System: Using handlebars to parse dynamic node variables. Node configurations (like HTTP Body or User Prompts) can reference upstream node outputs using double curly braces (e.g., {{ myApiCall.httpResponse.data.userId }}).

Triggers:

Manual: Triggered via UI button click.

Google Forms & Stripe: Standalone API Webhook routes (/api/webhooks/google-form and stripe) that receive payloads, validate them, and trigger the Inngest workflow with initial context data.

Executors:

HTTP Request: Utilizes ky to perform GET/POST requests, capturing headers and JSON.

AI Models: Leverages vercel/ai (generateText) with dynamic model selection and context-populated system/user prompts.

Discord & Slack: Posts templated messages directly to webhooks.

Real-time Node Status: Inngest Realtime channels push WebSockets updates directly to individual React Flow nodes, turning their indicator dots to loading (spinner), success (green check), or error (red X).

Execution History UI: A robust log list for every workflow run, parsing durations (date-fns), success/fail badges, output JSON payloads, and collapsible error stack traces.