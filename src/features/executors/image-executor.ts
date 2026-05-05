/**
 * Image Generation Executor
 * Supports: OpenAI DALL-E, Stability AI, and other image generation APIs
 */

import ky from "ky";

export interface ImageExecutorInput {
  provider: "openai" | "stability" | "replicate";
  apiKey: string;
  prompt: string;
  model?: string;
  size?: string;
  quality?: string;
  style?: string;
  n?: number; // Number of images
  negativePrompt?: string;
  steps?: number;
  cfgScale?: number;
  seed?: number;
}

export interface ImageExecutorOutput {
  images: Array<{
    url?: string;
    b64_json?: string;
    revisedPrompt?: string;
  }>;
  provider: string;
  model: string;
  duration: number;
  metadata?: {
    seed?: number;
    steps?: number;
    cfgScale?: number;
  };
}

export class ImageExecutorError extends Error {
  constructor(
    message: string,
    public provider?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "ImageExecutorError";
  }
}

/**
 * Validates image executor input
 */
function validateInput(input: ImageExecutorInput): void {
  if (!input.apiKey) {
    throw new ImageExecutorError("API key is required", input.provider);
  }

  if (!input.prompt || input.prompt.trim() === "") {
    throw new ImageExecutorError("Prompt is required", input.provider);
  }

  if (input.prompt.length > 4000) {
    throw new ImageExecutorError(
      "Prompt is too long (max 4000 characters)",
      input.provider
    );
  }

  if (input.n !== undefined && (input.n < 1 || input.n > 10)) {
    throw new ImageExecutorError(
      "Number of images must be between 1 and 10",
      input.provider
    );
  }
}

/**
 * Execute OpenAI DALL-E image generation
 */
async function executeOpenAI(input: ImageExecutorInput): Promise<ImageExecutorOutput> {
  const {
    apiKey,
    prompt,
    model = "dall-e-3",
    size = "1024x1024",
    quality = "standard",
    style = "vivid",
    n = 1,
  } = input;

  try {
    const response = await ky.post("https://api.openai.com/v1/images/generations", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      json: {
        model,
        prompt,
        n,
        size,
        quality,
        style,
        response_format: "url",
      },
      timeout: 120000, // 2 minutes for image generation
    }).json<any>();

    return {
      images: response.data.map((img: any) => ({
        url: img.url,
        revisedPrompt: img.revised_prompt,
      })),
      provider: "openai",
      model,
      duration: 0,
    };
  } catch (error: any) {
    if (error.response) {
      const errorData = await error.response.json().catch(() => ({}));
      throw new ImageExecutorError(
        errorData.error?.message || "OpenAI image generation failed",
        "openai",
        error
      );
    }
    throw new ImageExecutorError(
      `OpenAI image generation failed: ${error.message}`,
      "openai",
      error
    );
  }
}

/**
 * Execute Stability AI image generation
 */
async function executeStability(input: ImageExecutorInput): Promise<ImageExecutorOutput> {
  const {
    apiKey,
    prompt,
    model = "stable-diffusion-xl-1024-v1-0",
    negativePrompt,
    steps = 30,
    cfgScale = 7,
    seed,
  } = input;

  try {
    const response = await ky.post(
      `https://api.stability.ai/v1/generation/${model}/text-to-image`,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        json: {
          text_prompts: [
            { text: prompt, weight: 1 },
            ...(negativePrompt ? [{ text: negativePrompt, weight: -1 }] : []),
          ],
          cfg_scale: cfgScale,
          steps,
          ...(seed && { seed }),
        },
        timeout: 120000,
      }
    ).json<any>();

    return {
      images: response.artifacts.map((artifact: any) => ({
        b64_json: artifact.base64,
      })),
      provider: "stability",
      model,
      duration: 0,
      metadata: {
        seed: response.artifacts[0]?.seed,
        steps,
        cfgScale,
      },
    };
  } catch (error: any) {
    if (error.response) {
      const errorData = await error.response.json().catch(() => ({}));
      throw new ImageExecutorError(
        errorData.message || "Stability AI image generation failed",
        "stability",
        error
      );
    }
    throw new ImageExecutorError(
      `Stability AI image generation failed: ${error.message}`,
      "stability",
      error
    );
  }
}

/**
 * Execute Replicate image generation
 */
async function executeReplicate(input: ImageExecutorInput): Promise<ImageExecutorOutput> {
  const {
    apiKey,
    prompt,
    model = "stability-ai/sdxl",
    negativePrompt,
    steps = 30,
    cfgScale = 7,
    seed,
  } = input;

  try {
    // Create prediction
    const prediction = await ky.post("https://api.replicate.com/v1/predictions", {
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      json: {
        version: model,
        input: {
          prompt,
          negative_prompt: negativePrompt,
          num_inference_steps: steps,
          guidance_scale: cfgScale,
          ...(seed && { seed }),
        },
      },
    }).json<any>();

    // Poll for completion
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max

    while (result.status !== "succeeded" && result.status !== "failed" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      result = await ky.get(prediction.urls.get, {
        headers: {
          "Authorization": `Token ${apiKey}`,
        },
      }).json<any>();
      attempts++;
    }

    if (result.status === "failed") {
      throw new ImageExecutorError(
        result.error || "Image generation failed",
        "replicate"
      );
    }

    if (result.status !== "succeeded") {
      throw new ImageExecutorError(
        "Image generation timeout",
        "replicate"
      );
    }

    return {
      images: Array.isArray(result.output)
        ? result.output.map((url: string) => ({ url }))
        : [{ url: result.output }],
      provider: "replicate",
      model,
      duration: 0,
      metadata: {
        seed,
        steps,
        cfgScale,
      },
    };
  } catch (error: any) {
    if (error instanceof ImageExecutorError) {
      throw error;
    }
    if (error.response) {
      const errorData = await error.response.json().catch(() => ({}));
      throw new ImageExecutorError(
        errorData.detail || "Replicate image generation failed",
        "replicate",
        error
      );
    }
    throw new ImageExecutorError(
      `Replicate image generation failed: ${error.message}`,
      "replicate",
      error
    );
  }
}

/**
 * Main image generation executor
 */
export async function executeImageGeneration(
  input: ImageExecutorInput
): Promise<ImageExecutorOutput> {
  const startTime = Date.now();

  // Validate input
  validateInput(input);

  let result: ImageExecutorOutput;

  try {
    switch (input.provider) {
      case "openai":
        result = await executeOpenAI(input);
        break;
      case "stability":
        result = await executeStability(input);
        break;
      case "replicate":
        result = await executeReplicate(input);
        break;
      default:
        throw new ImageExecutorError(
          `Unsupported image provider: ${input.provider}`
        );
    }

    result.duration = Date.now() - startTime;
    return result;
  } catch (error: any) {
    // Handle common errors
    if (error instanceof ImageExecutorError) {
      throw error;
    }

    if (error.message?.includes("API key") || error.message?.includes("authentication")) {
      throw new ImageExecutorError(
        "Invalid or missing API key",
        input.provider,
        error
      );
    }

    if (error.message?.includes("rate limit") || error.response?.status === 429) {
      throw new ImageExecutorError(
        "Rate limit exceeded. Please try again later",
        input.provider,
        error
      );
    }

    if (error.message?.includes("quota") || error.message?.includes("insufficient")) {
      throw new ImageExecutorError(
        "API quota exceeded or insufficient credits",
        input.provider,
        error
      );
    }

    throw new ImageExecutorError(
      `Image generation failed: ${error.message}`,
      input.provider,
      error
    );
  }
}
