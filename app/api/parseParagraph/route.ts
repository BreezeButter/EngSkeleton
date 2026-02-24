/**
 * POST /api/parseParagraph
 *
 * Accepts a JSON body with a `paragraph` field, splits it into sentences,
 * parses each sentence (via Gemini when available, otherwise locally), and
 * returns an array of ParsedSentence objects.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  parseSentence,
  splitIntoSentences,
  type ParsedSentence,
} from "@/lib/parseSentence";

const SYSTEM_PROMPT = `You are an expert English grammar analyzer. Given an English sentence, decompose it into the following components and return ONLY valid JSON (no markdown, no code fences):

{
  "subject": "the subject of the sentence",
  "verb": "the main verb or verb phrase",
  "object": "the object of the sentence, or empty string if none",
  "tense": "one of: Present Simple, Past Simple, Future Simple, Present Continuous, Past Continuous, Future Continuous, Present Perfect, Past Perfect, Future Perfect, Present Perfect Continuous, Past Perfect Continuous, Future Perfect Continuous",
  "voice": "Active or Passive",
  "phrases": ["array of prepositional or adverbial phrases, empty array if none"],
  "wordTags": [{"word": "each", "pos": "DET"}, {"word": "token", "pos": "NOUN"}],
  "grammarSuggestions": ["array of grammar suggestions or corrections, empty array if none"]
}

For wordTags, assign one of these POS labels to every token: NOUN, VERB, AUX, ADJ, ADV, DET, PRON, PREP, CONJ, NUM, PUNCT, OTHER.
For grammarSuggestions, list any grammar issues found (subject-verb agreement, passive voice, punctuation, etc.) with recommended corrections.`;

/** Attempt to parse a single sentence with Gemini; returns null on failure. */
async function parseWithGemini(
  apiKey: string,
  sentence: string,
): Promise<ParsedSentence | null> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      `Sentence: "${sentence}"`,
    ]);

    const text = result.response.text().trim();
    const json = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "");

    const parsed = JSON.parse(json) as Omit<ParsedSentence, "original">;

    return {
      original: sentence,
      subject: parsed.subject ?? "",
      verb: parsed.verb ?? "",
      object: parsed.object ?? "",
      tense: parsed.tense ?? "Unknown",
      voice: parsed.voice === "Passive" ? "Passive" : "Active",
      phrases: Array.isArray(parsed.phrases) ? parsed.phrases : [],
      wordTags: Array.isArray(parsed.wordTags) ? parsed.wordTags : [],
      grammarSuggestions: Array.isArray(parsed.grammarSuggestions)
        ? parsed.grammarSuggestions
        : [],
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: { paragraph?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const paragraph = body.paragraph?.trim();
  if (!paragraph) {
    return NextResponse.json(
      { error: "Missing 'paragraph' field" },
      { status: 400 },
    );
  }

  const sentences = splitIntoSentences(paragraph);
  if (sentences.length === 0) {
    return NextResponse.json([] as ParsedSentence[]);
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  const results: ParsedSentence[] = await Promise.all(
    sentences.map(async (sentence) => {
      if (apiKey) {
        const geminiResult = await parseWithGemini(apiKey, sentence);
        if (geminiResult) return geminiResult;
        console.error(
          "Gemini parse failed for sentence, falling back to heuristic:",
          sentence,
        );
      }
      return parseSentence(sentence);
    }),
  );

  return NextResponse.json(results);
}
