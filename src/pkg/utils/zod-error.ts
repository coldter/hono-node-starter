import type { z } from "zod";

export function parseZodErrorMessage(err: z.ZodError): string {
  try {
    const arr = JSON.parse(err.message) as Array<{
      message: string;
      path: Array<string>;
    }>;
    const { path, message } = arr[0] || { message: "", path: [] };
    return path.length ? `${path.join(".")} ${message}` : `${message}`;
  } catch {
    return err.message;
  }
}
