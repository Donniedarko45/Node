import ky, { HTTPError } from "ky";

export interface WebhookExecutorInput {
  webhookUrl: string;
  message: string;
  provider: "discord" | "slack";
  timeout?: number;
}

export interface WebhookExecutorOutput {
  success: boolean;
  status: number;
  message: string;
  duration: number;
}

export class WebhookExecutorError extends Error {
  constructor(
    message: string,
    public provider?: string,
    public status?: number
  ) {
    super(message);
    this.name = "WebhookExecutorError";
  }
}

/**
 * Validates webhook executor input
 */
function validateInput(input: WebhookExecutorInput): void {
  if (!input.webhookUrl) {
    throw new WebhookExecutorError("Webhook URL is required", input.provider);
  }

  // Validate URL format
  try {
    const url = new URL(input.webhookUrl);
    
    // Validate provider-specific URL patterns
    if (input.provider === "discord" && !url.hostname.includes("discord.com")) {
      throw new WebhookExecutorError(
        "Invalid Discord webhook URL",
        input.provider
      );
    }
    
    if (input.provider === "slack" && !url.hostname.includes("slack.com")) {
      throw new WebhookExecutorError(
        "Invalid Slack webhook URL",
        input.provider
      );
    }
  } catch (error: any) {
    throw new WebhookExecutorError(
      `Invalid webhook URL format: ${error.message}`,
      input.provider
    );
  }

  if (!input.message) {
    throw new WebhookExecutorError("Message is required", input.provider);
  }

  // Validate message length
  const maxLength = input.provider === "discord" ? 2000 : 3000;
  if (input.message.length > maxLength) {
    throw new WebhookExecutorError(
      `Message exceeds maximum length of ${maxLength} characters`,
      input.provider
    );
  }
}

/**
 * Formats payload for specific webhook provider
 */
function formatPayload(provider: string, message: string): any {
  switch (provider) {
    case "discord":
      return { content: message };
    case "slack":
      return { text: message };
    default:
      throw new WebhookExecutorError(`Unsupported webhook provider: ${provider}`);
  }
}

/**
 * Executes webhook with comprehensive error handling
 */
export async function executeWebhook(
  input: WebhookExecutorInput
): Promise<WebhookExecutorOutput> {
  const startTime = Date.now();
  
  // Validate input
  validateInput(input);

  const { webhookUrl, message, provider, timeout = 10000 } = input;

  try {
    const payload = formatPayload(provider, message);

    const response = await ky.post(webhookUrl, {
      json: payload,
      timeout,
      retry: {
        limit: 0, // We handle retries at the execution engine level
      },
    });

    return {
      success: response.ok,
      status: response.status,
      message: "Webhook sent successfully",
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    // Handle HTTP errors
    if (error instanceof HTTPError) {
      let errorMessage = "Webhook execution failed";

      if (error.response.status === 400) {
        errorMessage = "Invalid webhook payload";
      } else if (error.response.status === 401 || error.response.status === 403) {
        errorMessage = "Webhook authentication failed - check your webhook URL";
      } else if (error.response.status === 404) {
        errorMessage = "Webhook not found - the webhook may have been deleted";
      } else if (error.response.status === 429) {
        errorMessage = "Rate limit exceeded - too many requests";
      } else if (error.response.status >= 500) {
        errorMessage = `${provider} server error - please try again later`;
      }

      throw new WebhookExecutorError(
        errorMessage,
        provider,
        error.response.status
      );
    }

    // Handle timeout errors
    if (error.name === "TimeoutError") {
      throw new WebhookExecutorError(
        `Webhook request timeout after ${timeout}ms`,
        provider,
        408
      );
    }

    // Generic error
    throw new WebhookExecutorError(
      `Webhook execution failed: ${error.message}`,
      provider
    );
  }
}
