"use client";

/**
 * Home Page
 *
 * Main page of the English Sentence Parser application.
 * Users can input sentences or paragraphs, parse them via the Gemini-powered
 * API, view results in card or table layout, and export everything as JSON.
 */

import React, { useState } from "react";
import { Divider, Tabs, Tab } from "@heroui/react";
import SentenceInput from "@/components/SentenceInput";
import ParsedResultCard from "@/components/ParsedResultCard";
import ParsedResultTable from "@/components/ParsedResultTable";
import ExportButton from "@/components/ExportButton";
import type { ParsedSentence } from "@/lib/parseSentence";

export default function Home() {
  /** Stores all parsed sentence results. */
  const [results, setResults] = useState<ParsedSentence[]>([]);
  /** Indicates whether a parse request is in-flight. */
  const [loading, setLoading] = useState(false);
  /** Holds the latest error message, if any. */
  const [error, setError] = useState<string | null>(null);

  /** Parse a single sentence via the API and prepend it to the results list. */
  const handleParse = async (sentence: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const parsed: ParsedSentence = await res.json();
      setResults((prev) => [parsed, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /** Parse a paragraph via the API: splits into sentences and prepends all results. */
  const handleParseParagraph = async (paragraph: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parseParagraph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paragraph }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const parsed: ParsedSentence[] = await res.json();
      setResults((prev) => [...parsed, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-10 sm:px-8">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          English Sentence Parser
        </h1>
        <p className="text-default-500">
          Enter a sentence or a full paragraph to parse it into Subject, Verb,
          Object, Tense, Voice, Phrases, word-level POS tags, and grammar
          suggestions.
        </p>
      </header>

      {/* Sentence / Paragraph input area */}
      <SentenceInput
        onParse={handleParse}
        onParseParagraph={handleParseParagraph}
        isLoading={loading}
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}

      <Divider />

      {/* Results section */}
      {results.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Parsed Results ({results.length})
            </h2>
            <ExportButton results={results} />
          </div>

          {/* Toggle between card and table view */}
          <Tabs aria-label="Result view" variant="underlined" color="primary">
            <Tab key="cards" title="Card View">
              <div className="flex flex-col gap-4 pt-2">
                {results.map((r, i) => (
                  <ParsedResultCard key={i} result={r} index={i} />
                ))}
              </div>
            </Tab>
            <Tab key="table" title="Table View">
              <div className="pt-2">
                <ParsedResultTable results={results} />
              </div>
            </Tab>
          </Tabs>
        </section>
      )}
    </div>
  );
}
