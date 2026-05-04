# Nodebase - Quick Start Guide

## 🚀 What We've Built So Far

A workflow automation platform with:
- ✅ **Authentication** (Better Auth with email/password)
- ✅ **Workflows** (Create, edit, delete with visual editor)
- ✅ **Credentials** (Encrypted API key storage - BYOK)
- ✅ **Executions** (Track workflow runs with status)
- ✅ **Premium Gating** (Polar.sh integration)

## 📋 Prerequisites

1. **Node.js** 20+ installed
2. **PostgreSQL** database (recommend Neon DB)
3. **Polar.sh** account for subscriptions
4. **Inngest** account for background jobs

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/nodebase"

# Encryption (generate a random 32-char string)
ENCRYPTION_KEY="your-32-character-secret-key-here"

# Better Auth
BETTER_AUTH_SECRET="your-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Polar.sh (for subscriptions)
POLAR_ACCESS_TOKEN="your-polar-token"
POLAR_SUCCESS_URL="http://localhost:3000/workflows"

# Inngest (for background jobs)
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"

# Node Environment
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🎯 Current Features

### 1. **Workflows Page** (`/workflows`)
- Create new workflows
- Search and paginate
- Delete workflows
- Click to open editor

### 2. **Editor** (`/workflows/[id]`)
- Visual canvas powered by React Flow
- Loads nodes and connections from database
- Currently displays INITIAL node
- ⚠️ Node editing not yet implemented

### 3. **Credentials Page** (`/credenetials`)
- Add API keys (OpenAI, Anthropic, Gemini, Discord, Slack)
- Values are encrypted before storage
- Premium feature (requires subscription)
- Search and paginate

### 4. **Executions Page** (`/executions`)
- View all workflow runs
- Status badges (Running, Success, Failed)
- Duration tracking
- Filter by workflow

## 🔐 Authentication Flow

1. Visit `/signup` to create account
2. Or `/login` to sign in
3. Redirects to `/workflows` on success

## 💳 Premium Features

Features gated by `premiumProcedure`:
- Creating credentials
- (More to be added)

To test premium features:
1. Sign up for account
2. Visit Polar checkout (link in upgrade modal)
3. Complete subscription
4. Premium features unlock automatically

## 📊 Database Schema

### Key Models:
- **User**: Authentication
- **Workflow**: User's automation workflows
- **Node**: Individual steps in workflow
- **Connection**: Edges between nodes
- **Credential**: Encrypted API keys
- **Execution**: Workflow run history

### Node Types Available:
- `INITIAL` - Starting node (auto-created)
- `MANUAL_TRIGGER` - User-triggered start
- `HTTP_REQUEST` - Make API calls
- `GOOGLE_FORM_TRIGGER` - Google Forms webhook
- `STRIPE_TRIGGER` - Stripe webhook
- `OPENAI` - OpenAI API calls
- `GEMINI` - Google Gemini API
- `ANTHROPIC` - Anthropic Claude API
- `DISCORD` - Send Discord messages
- `SLACK` - Send Slack messages

## 🧪 Testing the App

### Test Workflow Creation:
1. Go to `/workflows`
2. Click "New workflow"
3. Redirects to editor with INITIAL node

### Test Credentials:
1. Go to `/credenetials`
2. Click "New credential"
3. Fill form (name, type, API key)
4. ⚠️ Requires premium subscription

### Test Executions:
1. Go to `/executions`
2. Currently empty (execution engine not built yet)

## 🐛 Known Issues

1. **Editor is read-only**: Can view nodes but not edit/add/delete
2. **No execution engine**: Workflows don't run yet
3. **No node configuration**: Can't configure node settings
4. **No templating**: Can't use variables between nodes
5. **Missing .env**: Need to create manually

## 🎨 Tech Highlights

### Type Safety
- **tRPC**: End-to-end type safety from DB to UI
- **Prisma**: Type-safe database queries
- **Zod**: Runtime validation

### Data Fetching Pattern
```typescript
// Server: Prefetch data
prefetchWorkflow(workflowId);

// Client: Use suspense query
const { data } = useSuspenseWorkflow(workflowId);
```

### Security
- **Credentials**: Encrypted with `cryptr` before storage
- **Auth**: Session-based with Better Auth
- **Authorization**: tRPC procedures check user ownership

### UI Patterns
- **Entity Components**: Reusable CRUD patterns
- **Suspense**: Loading states handled by React
- **Error Boundaries**: Graceful error handling

## 📚 Next Development Steps

See `IMPLEMENTATION_STATUS.md` for detailed roadmap.

**Immediate priorities:**
1. Node components and selector UI
2. Node configuration panels
3. Save node changes to database
4. Build execution engine with Inngest

## 🆘 Troubleshooting

### "Prisma Client not generated"
```bash
npx prisma generate
```

### "Database connection failed"
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Test connection with `npx prisma db pull`

### "Unauthorized" errors
- Clear cookies and re-login
- Check Better Auth configuration

### TypeScript errors
```bash
# Restart TypeScript server in VS Code
# Or run type check:
npx tsc --noEmit
```

## 📖 Documentation

- **Prisma**: https://www.prisma.io/docs
- **tRPC**: https://trpc.io/docs
- **React Flow**: https://reactflow.dev/
- **Better Auth**: https://www.better-auth.com/docs
- **Polar.sh**: https://docs.polar.sh/
- **Inngest**: https://www.inngest.com/docs

---

**Ready to continue building?** Check `IMPLEMENTATION_STATUS.md` for the next features to implement! 🚀
