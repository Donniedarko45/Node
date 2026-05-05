import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export interface AIExecutorInput {
  provider: "openai" | "anthropic" | "gemini";
  model: string;
  apiKey: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIExecutorOutput {
  text: string;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
  duration: number;
}

export class AIExecutorError extends Error {
  constructor(
    message: string,
    public provider?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "AIExecutorError";
  }
}

/**
 * Validates AI executor input
 */
function validateInput(input: AIExecutorInput): void {
  if (!input.apiKey) {
    throw new AIExecutorError("API key is required", input.provider);
  }

  if (!input.model) {
    throw new AIExecutorError("Model is required", input.provider);
  }

  if (!input.userPrompt) {
    throw new AIExecutorError("User prompt is required", input.provider);
  }

  if (input.temperature !== undefined && (input.temperature < 0 || input.temperature > 2)) {
    throw new AIExecutorError(
      "Temperature must be between 0 and 2",
      input.provider
    );
  }

  if (input.maxTokens !== undefined && input.maxTokens < 1) {
    throw new AIExecutorError(
      "Max tokens must be greater than 0",
      input.provider
    );
  }
}

/**
 * Gets the appropriate AI provider instance
 */
function getAIProvider(provider: string, apiKey: string) {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey });
    case "anthropic":
      return createAnthropic({ apiKey });
    case "gemini":
      return createGoogleGenerativeAI({ apiKey });
    default:
      throw new AIExecutorError(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Executes AI model with comprehensive error handling
 */
export async function executeAIModel(
  input: AIExecutorInput
): Promise<AIExecutorOutput> {
  const startTime = Date.now();
  
  // Validate input
  validateInput(input);

  const {
    provider,
    model,
    apiKey,
    systemPrompt,
    userPrompt,
    temperature = 0.7,
    maxTokens = 1000,
  } = input;

  try {
    const aiProvider = getAIProvider(provider, apiKey);

    const result = await generateText({
      model: aiProvider(model),
      system: systemPrompt,
      prompt: userPrompt,
      temperature,
      maxTokens,
    });

    return {
      text: result.text,
      finishReason: result.finishReason,
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      },
      model,
      provider,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    // Handle API key errors
    if (error.message?.includes("API key") || error.message?.includes("authentication")) {
      throw new AIExecutorError(
        "Invalid or missing API key",
        provider,
        error
      );
    }

    // Handle rate limit errors
    if (error.message?.includes("rate limit") || error.statusCode === 429) {
      throw new AIExecutorError(
        "Rate limit exceeded. Please try again later",
        provider,
        error
      );
    }

    // Handle quota errors
    if (error.message?.includes("quota") || error.message?.includes("insufficient")) {
      throw new AIExecutorError(
        "API quota exceeded or insufficient credits",
        provider,
        error
      );
    }

    // Handle model not found errors
    if (error.message?.includes("model") && error.message?.includes("not found")) {
      throw new AIExecutorError(
        `Model "${model}" not found or not accessible`,
        provider,
        error
      );
    }

    // Generic error
    throw new AIExecutorError(
      `AI execution failed: ${error.message}`,
      provider,
      error
    );
  }
}
