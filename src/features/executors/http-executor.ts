import ky, { HTTPError } from "ky";

export interface HttpExecutorInput {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  headers?: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
  timeout?: number;
}

export interface HttpExecutorOutput {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
}

export class HttpExecutorError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = "HttpExecutorError";
  }
}

/**
 * Validates HTTP executor input
 */
function validateInput(input: HttpExecutorInput): void {
  if (!input.url) {
    throw new HttpExecutorError("URL is required");
  }

  // Validate URL format
  try {
    new URL(input.url);
  } catch {
    throw new HttpExecutorError(`Invalid URL format: ${input.url}`);
  }

  // Validate method
  const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  if (!validMethods.includes(input.method)) {
    throw new HttpExecutorError(`Invalid HTTP method: ${input.method}`);
  }

  // Validate body is valid JSON if provided
  if (input.body) {
    try {
      JSON.parse(input.body);
    } catch {
      throw new HttpExecutorError("Request body must be valid JSON");
    }
  }
}

/**
 * Executes HTTP request with comprehensive error handling
 */
export async function executeHttpRequest(
  input: HttpExecutorInput
): Promise<HttpExecutorOutput> {
  const startTime = Date.now();
  
  // Validate input
  validateInput(input);

  const { method, url, headers = {}, body, queryParams, timeout = 30000 } = input;

  try {
    const response = await ky(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...(body && { json: JSON.parse(body) }),
      ...(queryParams && { searchParams: queryParams }),
      timeout,
      retry: {
        limit: 0, // We handle retries at the execution engine level
      },
    });

    // Try to parse as JSON, fallback to text
    let data: any;
    const contentType = response.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else if (contentType.includes("text/")) {
      data = await response.text();
    } else {
      // For other content types, try JSON first, then text
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }
    }

    // Convert Headers to plain object
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    // Handle HTTP errors
    if (error instanceof HTTPError) {
      let errorData: any;
      const contentType = error.response.headers.get("content-type") || "";
      
      try {
        if (contentType.includes("application/json")) {
          errorData = await error.response.json();
        } else {
          errorData = await error.response.text();
        }
      } catch {
        errorData = "Unable to parse error response";
      }

      const errorHeaders: Record<string, string> = {};
      error.response.headers.forEach((value: string, key: string) => {
        errorHeaders[key] = value;
      });

      // For 4xx and 5xx errors, throw an error
      if (error.response.status >= 400) {
        throw new HttpExecutorError(
          `HTTP ${error.response.status}: ${error.response.statusText}`,
          error.response.status,
          errorData
        );
      }

      // Otherwise return the response
      return {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: errorHeaders,
        data: errorData,
        duration: Date.now() - startTime,
      };
    }

    // Handle timeout errors
    if (error.name === "TimeoutError") {
      throw new HttpExecutorError(
        `Request timeout after ${timeout}ms`,
        408
      );
    }

    // Handle network errors
    throw new HttpExecutorError(
      `HTTP Request failed: ${error.message}`,
      undefined,
      error
    );
  }
}
