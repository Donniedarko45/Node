import Handlebars from "handlebars";

/**
 * Execution context for workflow
 * Maps node IDs to their output data
 */
export type ExecutionContext = Record<string, any>;

/**
 * Resolves template variables in a string using Handlebars
 * @param template - String with {{ variable }} syntax
 * @param context - Execution context with node outputs
 * @returns Resolved string
 */
export function resolveTemplate(
  template: string,
  context: ExecutionContext
): string {
  try {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(context);
  } catch (error: any) {
    throw new Error(`Template resolution failed: ${error.message}`);
  }
}

/**
 * Resolves templates in an object recursively
 * @param obj - Object with potential template strings
 * @param context - Execution context
 * @returns Object with resolved templates
 */
export function resolveObjectTemplates(
  obj: any,
  context: ExecutionContext
): any {
  if (typeof obj === "string") {
    return resolveTemplate(obj, context);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => resolveObjectTemplates(item, context));
  }

  if (obj && typeof obj === "object") {
    const resolved: any = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveObjectTemplates(value, context);
    }
    return resolved;
  }

  return obj;
}

/**
 * Extracts variable names from a template string
 * @param template - String with {{ variable }} syntax
 * @returns Array of variable names
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1].trim());
  }

  return variables;
}

/**
 * Validates that all required variables are present in context
 * @param template - Template string
 * @param context - Execution context
 * @returns Array of missing variables
 */
export function validateTemplate(
  template: string,
  context: ExecutionContext
): string[] {
  const variables = extractVariables(template);
  const missing: string[] = [];

  for (const variable of variables) {
    // Check if variable exists in context (supports dot notation)
    const parts = variable.split(".");
    let current = context;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        missing.push(variable);
        break;
      }
    }
  }

  return missing;
}
