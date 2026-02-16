/**
 * Safely extract a route parameter as a string.
 * Express 5 types params as `string | string[]`.
 * After Zod validation, we know params are strings.
 */
export function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0];
  return value ?? '';
}

