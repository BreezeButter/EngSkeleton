# EngSkeleton

## Configuration

The application uses the Google Gemini API. You need to provide an API key before running the app.

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and replace the placeholder with your actual Gemini API key:

   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   You can obtain an API key from <https://aistudio.google.com/apikey>.

3. The key is loaded at runtime via `lib/config.ts`:

   ```ts
   import { getConfig } from "@/lib/config";

   const { geminiApiKey } = getConfig();
   ```