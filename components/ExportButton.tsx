"use client";

/**
 * ExportButton.tsx
 *
 * Button that exports the current parsed results as a downloadable JSON file.
 * Creates a Blob, generates a temporary URL, and triggers a download via a
 * hidden anchor element.
 */

import React from "react";
import { Button } from "@heroui/react";
import type { ParsedSentence } from "@/lib/parseSentence";

interface ExportButtonProps {
  /** The parsed results to export. */
  results: ParsedSentence[];
}

export default function ExportButton({ results }: ExportButtonProps) {
  /** Build a JSON Blob and trigger a file download. */
  const handleExport = () => {
    const json = JSON.stringify(results, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "parsed-sentences.json";
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      color="secondary"
      variant="bordered"
      onPress={handleExport}
      isDisabled={results.length === 0}
    >
      Export as JSON
    </Button>
  );
}
