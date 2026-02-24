"use client";

/**
 * ParsedResultCard.tsx
 *
 * Displays the parsed grammatical breakdown of a sentence inside a
 * HeroUI Card. Each component (Subject, Verb, Object, Tense, Voice,
 * Phrases) is shown as a color-coded Chip for quick visual scanning.
 */

import React from "react";
import { Card, CardHeader, CardBody, Chip, Divider } from "@heroui/react";
import type { ParsedSentence } from "@/lib/parseSentence";

/** Color map for different grammatical components. */
const COMPONENT_COLORS: Record<string, "primary" | "success" | "warning" | "danger" | "secondary" | "default"> = {
  Subject: "primary",
  Verb: "success",
  Object: "warning",
  Tense: "secondary",
  "Active Voice": "default",
  "Passive Voice": "danger",
  Phrase: "secondary",
};

interface ParsedResultCardProps {
  /** The parsed sentence data to display. */
  result: ParsedSentence;
  /** Index of this result (for display numbering). */
  index: number;
}

export default function ParsedResultCard({ result, index }: ParsedResultCardProps) {
  return (
    <Card className="w-full" shadow="sm">
      <CardHeader className="flex flex-col items-start gap-1 pb-1">
        <p className="text-xs text-default-500">Sentence #{index + 1}</p>
        <p className="text-base font-medium">&ldquo;{result.original}&rdquo;</p>
      </CardHeader>

      <Divider />

      <CardBody className="flex flex-wrap gap-3 py-4">
        {/* Subject */}
        {result.subject && (
          <Chip color={COMPONENT_COLORS.Subject} variant="flat">
            <span className="font-semibold">S:</span> {result.subject}
          </Chip>
        )}

        {/* Verb */}
        {result.verb && (
          <Chip color={COMPONENT_COLORS.Verb} variant="flat">
            <span className="font-semibold">V:</span> {result.verb}
          </Chip>
        )}

        {/* Object */}
        {result.object && (
          <Chip color={COMPONENT_COLORS.Object} variant="flat">
            <span className="font-semibold">O:</span> {result.object}
          </Chip>
        )}

        {/* Tense */}
        <Chip color={COMPONENT_COLORS.Tense} variant="flat">
          <span className="font-semibold">Tense:</span> {result.tense}
        </Chip>

        {/* Voice – highlighted differently for passive */}
        <Chip
          color={result.voice === "Passive" ? COMPONENT_COLORS["Passive Voice"] : COMPONENT_COLORS["Active Voice"]}
          variant={result.voice === "Passive" ? "solid" : "flat"}
        >
          <span className="font-semibold">Voice:</span> {result.voice}
        </Chip>

        {/* Phrases */}
        {result.phrases.map((phrase, i) => (
          <Chip key={i} color={COMPONENT_COLORS.Phrase} variant="bordered">
            <span className="font-semibold">Phrase:</span> {phrase}
          </Chip>
        ))}
      </CardBody>
    </Card>
  );
}
