/**
 * POST /api/parse
 *
 * Accepts a JSON body with a `sentence` field and returns the grammatical
 * decomposition produced by Google Gemini.  Falls back to the local
 * heuristic parser when the API key is not configured or the LLM call fails.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseSentence, type ParsedSentence } from "@/lib/parseSentence";

const SYSTEM_PROMPT = `You are an expert English grammar analyzer. Given an English sentence, decompose it into the following components and return ONLY valid JSON (no markdown, no code fences):

{
  "subject": "the subject of the sentence",
  "verb": "the main verb or verb phrase",
  "object": "the object of the sentence, or empty string if none",
  "tense": "one of: Present Simple, Past Simple, Future Simple, Present Continuous, Past Continuous, Future Continuous, Present Perfect, Past Perfect, Future Perfect, Present Perfect Continuous, Past Perfect Continuous, Future Perfect Continuous",
  "voice": "Active or Passive",
  "phrases": ["array of prepositional or adverbial phrases, empty array if none"]
}`;

export async function POST(request: NextRequest) {
  let body: { sentence?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const sentence = body.sentence?.trim();
  if (!sentence) {
    return NextResponse.json(
      { error: "Missing 'sentence' field" },
      { status: 400 },
    );
  }

  // Try Gemini first, fall back to heuristic parser
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent([
        SYSTEM_PROMPT,
        `Sentence: "${sentence}"`,
      ]);

      const text = result.response.text().trim();

      // Strip potential markdown fences the model may add
      const json = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "");

      const parsed = JSON.parse(json) as Omit<ParsedSentence, "original">;

      const response: ParsedSentence = {
        original: sentence,
        subject: parsed.subject ?? "",
        verb: parsed.verb ?? "",
        object: parsed.object ?? "",
        tense: parsed.tense ?? "Unknown",
        voice: parsed.voice === "Passive" ? "Passive" : "Active",
        phrases: Array.isArray(parsed.phrases) ? parsed.phrases : [],
      };

      return NextResponse.json(response);
    } catch (err) {
      console.error("Gemini API call failed, falling back to heuristic parser:", err);
    }
  }

  // Fallback: use the local heuristic parser
  const fallback = parseSentence(sentence);
  return NextResponse.json(fallback);
}
