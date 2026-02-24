"use client";

/**
 * Home Page
 *
 * Main page of the English Sentence Parser application.
 * Users can input sentences, parse them, view results in card or table
 * layout, and export everything as JSON.
 */

import React, { useState } from "react";
import { Divider, Tabs, Tab } from "@heroui/react";
import SentenceInput from "@/components/SentenceInput";
import ParsedResultCard from "@/components/ParsedResultCard";
import ParsedResultTable from "@/components/ParsedResultTable";
import ExportButton from "@/components/ExportButton";
import { parseSentence, type ParsedSentence } from "@/lib/parseSentence";

export default function Home() {
  /** Stores all parsed sentence results. */
  const [results, setResults] = useState<ParsedSentence[]>([]);

  /** Parse a new sentence and prepend it to the results list. */
  const handleParse = (sentence: string) => {
    const parsed = parseSentence(sentence);
    setResults((prev) => [parsed, ...prev]);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-10 sm:px-8">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          English Sentence Parser
        </h1>
        <p className="text-default-500">
          Enter an English sentence to parse it into Subject, Verb, Object,
          Tense, Voice, and Phrases.
        </p>
      </header>

      {/* Sentence input area */}
      <SentenceInput onParse={handleParse} />

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
