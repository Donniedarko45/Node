# Workflow Execution System - Production Ready

## Overview

The Nodebase workflow execution system is a production-ready engine that executes workflows with comprehensive error handling, retry logic, timeouts, and validation.

## Architecture

### Core Components

1. **Execution Engine** (`src/lib/execution-engine.ts`)
   - Main orchestration logic
   - Handles node execution order via topological sort
   - Implements retry logic with exponential backoff
   - Manages execution timeouts
   - Comprehensive error handling and logging

2. **Executors** (`src/features/executors/`)
   - **HTTP Executor**: Makes HTTP API calls with validation
   - **AI Executor**: Integrates with OpenAI, Anthropic, and Gemini
   - **Webhook Executor**: Sends messages to Discord and Slack

3. **Utilities**
   - **Topological Sort** (`src/lib/toposort.ts`): Determines execution order
   - **Templating** (`src/lib/templating.ts`): Resolves Handlebars templates
   - **Validation** (`src/lib/workflow-validator.ts`): Pre-execution validation

## Features

### ✅ Production-Ready Features

- **Retry Logic**: Automatic retries with exponential backoff (configurable)
- **Timeout Management**: Prevents infinite execution (default: 5 minutes)
- **Error Handling**: Comprehensive error catching and reporting
- **Validation**: Pre-execution workflow validation
- **Credential Management**: Encrypted credential storage and decryption
- **Progress Tracking**: Node-level execution results
- **Context Management**: Pass data between nodes using Handlebars templates
- **Circular Dependency Detection**: Prevents infinite loops
- **Rate Limit Handling**: Graceful handling of API rate limits

### 🔒 Security Features

- **Authentication**: Session-based authentication required
- **Authorization**: Users can only execute their own workflows
- **Credential Encryption**: API keys encrypted at rest using Cryptr
- **Input Validation**: All inputs validated before execution
- **Error Sanitization**: Sensitive data removed from error messages in production

### 📊 Monitoring & Debugging

- **Execution Records**: Every execution saved to database
- **Node Results**: Individual node execution status and duration
- **Error Stack Traces**: Detailed error information for debugging
- **Execution Duration**: Track performance metrics
- **Retry Counts**: Monitor how many retries were needed

## Usage

### Basic Execution

```typescript
import { executeWorkflow } from "@/lib/execution-engine";

const result = await executeWorkflow({
  workflowId: "workflow-id",
  userId: "user-id",
  triggerData: { /* initial data */ },
});

if (result.status === "SUCCESS") {
  console.log("Output:", result.output);
  console.log("Duration:", result.totalDuration, "ms");
} else {
  console.error("Error:", result.error);
}
```

### Advanced Configuration

```typescript
const result = await executeWorkflow({
  workflowId: "workflow-id",
  userId: "user-id",
  triggerData: { userId: 123, action: "signup" },
  timeout: 600000, // 10 minutes
  retryAttempts: 5, // Retry up to 5 times
  retryDelay: 2000, // 2 second initial delay
});
```

### Using the Hook (Client-Side)

```typescript
import { useRunWorkflow } from "@/features/workflows/hooks/use-run-workflow";

function MyComponent() {
  const runWorkflow = useRunWorkflow();

  const handleRun = async () => {
    const result = await runWorkflow.mutateAsync({
      workflowId: "workflow-id",
      triggerData: { /* data */ },
    });
    
    console.log("Execution ID:", result.executionId);
  };

  return (
    <button 
      onClick={handleRun}
      disabled={runWorkflow.isPending}
    >
      {runWorkflow.isPending ? "Running..." : "Run Workflow"}
    </button>
  );
}
```

## Node Types

### Trigger Nodes

1. **Manual Trigger**: User-initiated execution
2. **Google Forms**: Webhook trigger from form submissions
3. **Stripe**: Webhook trigger from Stripe events

### Executor Nodes

1. **HTTP Request**: Make API calls
   - Methods: GET, POST, PUT, DELETE, PATCH
   - Headers, query params, and body support
   - Automatic JSON parsing

2. **OpenAI**: Use GPT models
   - Models: gpt-4, gpt-3.5-turbo, etc.
   - System and user prompts
   - Temperature and max tokens control

3. **Anthropic**: Use Claude models
   - Models: claude-3-5-sonnet, claude-3-opus, etc.
   - Advanced reasoning capabilities

4. **Gemini**: Use Google AI models
   - Models: gemini-2.0-flash-exp, gemini-pro, etc.
   - Multimodal support

5. **Discord**: Send messages to Discord channels
   - Webhook-based integration
   - 2000 character limit

6. **Slack**: Send messages to Slack channels
   - Webhook-based integration
   - 3000 character limit

## Templating System

Use Handlebars syntax to reference data from previous nodes:

```handlebars
{{trigger.userId}}
{{httpRequest.data.email}}
{{aiNode.text}}
```

### Examples

**HTTP Request Body:**
```json
{
  "userId": "{{trigger.userId}}",
  "email": "{{trigger.email}}"
}
```

**AI Prompt:**
```
Analyze this user data: {{httpRequest.data}}
```

**Discord Message:**
```
New user signed up: {{trigger.email}}
AI Analysis: {{openai.text}}
```

## Error Handling

### Error Types

1. **ExecutionError**: General execution failures
2. **ExecutionTimeoutError**: Execution exceeded timeout
3. **HttpExecutorError**: HTTP request failures
4. **AIExecutorError**: AI model failures
5. **WebhookExecutorError**: Webhook delivery failures

### Retry Behavior

- **Retryable Errors**: Network errors, timeouts, rate limits
- **Non-Retryable Errors**: Authentication, invalid input, not found
- **Exponential Backoff**: Delay doubles with each retry (1s, 2s, 4s, 8s...)

### Error Response Format

```json
{
  "success": false,
  "error": "Node execution failed: Invalid API key",
  "executionId": "exec-123",
  "nodeResults": [
    {
      "nodeId": "node-1",
      "nodeName": "HTTP Request",
      "status": "success",
      "duration": 234
    },
    {
      "nodeId": "node-2",
      "nodeName": "OpenAI",
      "status": "failed",
      "error": "Invalid API key",
      "duration": 123,
      "retries": 3
    }
  ]
}
```

## Validation

### Pre-Execution Validation

The system validates workflows before execution:

- ✅ Workflow exists and belongs to user
- ✅ Workflow has at least one node
- ✅ Required credentials are configured
- ✅ No circular dependencies
- ✅ Node configurations are valid
- ✅ URLs are properly formatted
- ✅ Required fields are present

### Validation Errors

```typescript
{
  "valid": false,
  "errors": [
    {
      "type": "error",
      "message": "Node 'OpenAI' requires a credential",
      "nodeId": "node-123",
      "nodeName": "OpenAI"
    }
  ],
  "warnings": [
    {
      "type": "warning",
      "message": "Node 'HTTP Request' is not connected",
      "nodeId": "node-456"
    }
  ]
}
```

## Performance

### Optimization Strategies

1. **Parallel Execution**: Independent nodes can be executed in parallel (future enhancement)
2. **Connection Pooling**: Database connections are pooled
3. **Credential Caching**: Decrypted credentials cached per execution
4. **Timeout Management**: Prevents resource exhaustion
5. **Retry Limits**: Prevents infinite retry loops

### Benchmarks

- **Simple Workflow** (1-3 nodes): < 1 second
- **Medium Workflow** (4-10 nodes): 1-5 seconds
- **Complex Workflow** (10+ nodes): 5-30 seconds
- **AI-Heavy Workflow**: Depends on AI provider response time

## Database Schema

### Execution Table

```prisma
model Execution {
  id              String          @id @default(cuid())
  workflowId      String
  workflow        Workflow        @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  inngestEventId  String?
  status          ExecutionStatus @default(RUNNING)
  output          Json?
  errorStack      Json?
  startedAt       DateTime        @default(now())
  completedAt     DateTime?
}

enum ExecutionStatus {
  RUNNING
  SUCCESS
  FAILED
}
```

## API Endpoints

### Execute Workflow

**POST** `/api/workflows/[workflowId]/execute`

**Request:**
```json
{
  "triggerData": { /* optional initial data */ },
  "timeout": 300000,
  "retryAttempts": 3
}
```

**Response (Success):**
```json
{
  "success": true,
  "executionId": "exec-123",
  "output": { /* execution context */ },
  "nodeResults": [ /* node execution details */ ],
  "duration": 2345
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "Error message",
  "executionId": "exec-123",
  "nodeResults": [ /* partial results */ ],
  "duration": 1234
}
```

## Best Practices

### 1. Workflow Design

- ✅ Keep workflows focused and modular
- ✅ Use descriptive node names
- ✅ Add error handling nodes
- ✅ Test with sample data first
- ✅ Monitor execution times

### 2. Credential Management

- ✅ Use separate credentials for dev/prod
- ✅ Rotate credentials regularly
- ✅ Never hardcode API keys
- ✅ Use environment-specific credentials

### 3. Error Handling

- ✅ Expect failures and plan for them
- ✅ Use retry logic for transient errors
- ✅ Log errors for debugging
- ✅ Provide meaningful error messages

### 4. Performance

- ✅ Minimize API calls
- ✅ Cache results when possible
- ✅ Use appropriate timeouts
- ✅ Monitor execution duration

### 5. Security

- ✅ Validate all inputs
- ✅ Sanitize error messages
- ✅ Use HTTPS for all external calls
- ✅ Implement rate limiting

## Troubleshooting

### Common Issues

**Issue: "Workflow execution timeout"**
- Solution: Increase timeout or optimize slow nodes

**Issue: "Invalid API key"**
- Solution: Check credential configuration and encryption key

**Issue: "Circular dependency detected"**
- Solution: Review workflow connections and remove cycles

**Issue: "Node requires a credential"**
- Solution: Configure credential in node settings

**Issue: "Rate limit exceeded"**
- Solution: Add delays between requests or upgrade API plan

## Future Enhancements

- [ ] Parallel node execution
- [ ] Conditional branching
- [ ] Loop/iteration support
- [ ] Scheduled executions (cron)
- [ ] Real-time execution monitoring via WebSockets
- [ ] Execution history analytics
- [ ] Workflow versioning
- [ ] A/B testing support
- [ ] Execution rollback
- [ ] Custom node types via plugins

## Support

For issues or questions:
1. Check the execution logs in the database
2. Review error messages in the UI
3. Check node configurations
4. Verify credentials are valid
5. Test individual nodes in isolation

## License

This execution system is part of the Nodebase platform.
