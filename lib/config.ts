/**
 * Application configuration.
 *
 * Reads environment variables and exposes them in a typed object.
 * In a Next.js app, server-side code can access these values directly.
 * For client-side usage, prefix variables with NEXT_PUBLIC_.
 */

export interface Config {
  /** Gemini API key used to call Google Generative AI endpoints. */
  geminiApiKey: string;
}

/**
 * Returns the application configuration derived from environment variables.
 *
 * @throws {Error} If required environment variables are missing.
 */
export function getConfig(): Config {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey?.trim()) {
    throw new Error(
      "Missing GEMINI_API_KEY environment variable. " +
        "Copy .env.example to .env.local and set your key."
    );
  }

  return { geminiApiKey };
}
