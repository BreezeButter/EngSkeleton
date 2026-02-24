"use client";

/**
 * ParsedResultCard.tsx
 *
 * Displays the parsed grammatical breakdown of a sentence inside a
 * HeroUI Card. Shows SVO, tense, voice, phrases, per-word POS tags,
 * and grammar suggestions.
 */

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Divider,
  Button,
} from "@heroui/react";
import type { ParsedSentence } from "@/lib/parseSentence";

/** Color map for different grammatical components. */
const COMPONENT_COLORS: Record<
  string,
  "primary" | "success" | "warning" | "danger" | "secondary" | "default"
> = {
  Subject: "primary",
  Verb: "success",
  Object: "warning",
  Tense: "secondary",
  "Active Voice": "default",
  "Passive Voice": "danger",
  Phrase: "secondary",
};

/** Background color for POS tag chips. */
const POS_COLORS: Record<
  string,
  "primary" | "success" | "warning" | "danger" | "secondary" | "default"
> = {
  NOUN: "primary",
  VERB: "success",
  AUX: "success",
  ADJ: "warning",
  ADV: "secondary",
  DET: "default",
  PRON: "primary",
  PREP: "default",
  CONJ: "default",
  NUM: "warning",
  PUNCT: "default",
  OTHER: "default",
};

interface ParsedResultCardProps {
  /** The parsed sentence data to display. */
  result: ParsedSentence;
  /** Index of this result (for display numbering). */
  index: number;
}

export default function ParsedResultCard({
  result,
  index,
}: ParsedResultCardProps) {
  const [showWordTags, setShowWordTags] = useState(false);

  return (
    <Card className="w-full" shadow="sm">
      <CardHeader className="flex flex-col items-start gap-1 pb-1">
        <p className="text-xs text-default-500">Sentence #{index + 1}</p>
        <p className="text-base font-medium">&ldquo;{result.original}&rdquo;</p>
      </CardHeader>

      <Divider />

      <CardBody className="flex flex-col gap-4 py-4">
        {/* SVO / Tense / Voice / Phrases */}
        <div className="flex flex-wrap gap-3">
          {result.subject && (
            <Chip color={COMPONENT_COLORS.Subject} variant="flat">
              <span className="font-semibold">S:</span> {result.subject}
            </Chip>
          )}
          {result.verb && (
            <Chip color={COMPONENT_COLORS.Verb} variant="flat">
              <span className="font-semibold">V:</span> {result.verb}
            </Chip>
          )}
          {result.object && (
            <Chip color={COMPONENT_COLORS.Object} variant="flat">
              <span className="font-semibold">O:</span> {result.object}
            </Chip>
          )}
          <Chip color={COMPONENT_COLORS.Tense} variant="flat">
            <span className="font-semibold">Tense:</span> {result.tense}
          </Chip>
          <Chip
            color={
              result.voice === "Passive"
                ? COMPONENT_COLORS["Passive Voice"]
                : COMPONENT_COLORS["Active Voice"]
            }
            variant={result.voice === "Passive" ? "solid" : "flat"}
          >
            <span className="font-semibold">Voice:</span> {result.voice}
          </Chip>
          {result.phrases.map((phrase, i) => (
            <Chip
              key={i}
              color={COMPONENT_COLORS.Phrase}
              variant="bordered"
            >
              <span className="font-semibold">Phrase:</span> {phrase}
            </Chip>
          ))}
        </div>

        {/* Word Analysis (collapsible) */}
        {result.wordTags.length > 0 && (
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="light"
              onPress={() => setShowWordTags((v) => !v)}
              className="w-fit px-0 text-sm font-semibold text-default-600"
            >
              {showWordTags ? "▾ Hide Word Analysis" : "▸ Show Word Analysis"}
            </Button>
            {showWordTags && (
              <div className="flex flex-wrap gap-2 rounded-lg bg-default-50 p-3">
                {result.wordTags.map((wt, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span className="text-sm">{wt.word}</span>
                    <Chip
                      size="sm"
                      color={POS_COLORS[wt.pos] ?? "default"}
                      variant="flat"
                      className="h-5 min-w-0 px-1 text-[10px]"
                    >
                      {wt.pos}
                    </Chip>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grammar Suggestions */}
        {result.grammarSuggestions.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-lg border border-warning-200 bg-warning-50 p-3">
            <p className="text-sm font-semibold text-warning-700">
              💡 Grammar Suggestions
            </p>
            <ul className="list-inside list-disc space-y-1">
              {result.grammarSuggestions.map((s, i) => (
                <li key={i} className="text-sm text-warning-800">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
