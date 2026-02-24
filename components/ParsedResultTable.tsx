"use client";

/**
 * ParsedResultTable.tsx
 *
 * Renders all parsed sentences in a HeroUI Table view.
 * Columns: #, Subject, Verb, Object, Tense, Voice, Phrases.
 * Passive voice rows are highlighted with a danger color badge.
 */

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";
import type { ParsedSentence } from "@/lib/parseSentence";

interface ParsedResultTableProps {
  /** Array of parsed sentence results to display in the table. */
  results: ParsedSentence[];
}

/** Column definitions for the table. */
const COLUMNS = [
  { key: "index", label: "#" },
  { key: "subject", label: "Subject (S)" },
  { key: "verb", label: "Verb (V)" },
  { key: "object", label: "Object (O)" },
  { key: "tense", label: "Tense" },
  { key: "voice", label: "Voice" },
  { key: "phrases", label: "Phrases" },
];

export default function ParsedResultTable({ results }: ParsedResultTableProps) {
  return (
    <Table aria-label="Parsed sentence results" isStriped>
      <TableHeader>
        {COLUMNS.map((col) => (
          <TableColumn key={col.key}>{col.label}</TableColumn>
        ))}
      </TableHeader>
      <TableBody emptyContent="No sentences parsed yet.">
        {results.map((r, i) => (
          <TableRow key={i}>
            <TableCell>{i + 1}</TableCell>
            <TableCell>
              {r.subject ? (
                <Chip size="sm" color="primary" variant="flat">
                  {r.subject}
                </Chip>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>
              {r.verb ? (
                <Chip size="sm" color="success" variant="flat">
                  {r.verb}
                </Chip>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>
              {r.object ? (
                <Chip size="sm" color="warning" variant="flat">
                  {r.object}
                </Chip>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>
              <Chip size="sm" color="secondary" variant="flat">
                {r.tense}
              </Chip>
            </TableCell>
            <TableCell>
              <Chip
                size="sm"
                color={r.voice === "Passive" ? "danger" : "default"}
                variant={r.voice === "Passive" ? "solid" : "flat"}
              >
                {r.voice}
              </Chip>
            </TableCell>
            <TableCell>
              {r.phrases.length > 0
                ? r.phrases.map((p, j) => (
                    <Chip
                      key={j}
                      size="sm"
                      color="secondary"
                      variant="bordered"
                      className="mr-1 mb-1"
                    >
                      {p}
                    </Chip>
                  ))
                : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
