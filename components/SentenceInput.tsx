"use client";

/**
 * SentenceInput.tsx
 *
 * A controlled textarea component that lets users type or paste English
 * sentences or entire paragraphs. On submit it calls the provided `onParse`
 * (single sentence) or `onParseParagraph` (paragraph) callback depending on
 * the selected mode. Built with HeroUI (NextUI v2) components.
 */

import React, { useState } from "react";
import { Textarea, Button, Tabs, Tab } from "@heroui/react";

/** Props accepted by the SentenceInput component. */
interface SentenceInputProps {
  /** Callback invoked with the trimmed sentence when the user clicks Parse. */
  onParse: (sentence: string) => void;
  /** Callback invoked with the trimmed paragraph text when in paragraph mode. */
  onParseParagraph: (paragraph: string) => void;
  /** When true the parse button shows a loading spinner and is disabled. */
  isLoading?: boolean;
}

export default function SentenceInput({
  onParse,
  onParseParagraph,
  isLoading,
}: SentenceInputProps) {
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<"sentence" | "paragraph">("sentence");

  /** Handle the parse action for the active mode. */
  const handleParse = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (mode === "paragraph") {
      onParseParagraph(trimmed);
    } else {
      onParse(trimmed);
    }
  };

  const isParagraph = mode === "paragraph";

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Mode selector */}
      <Tabs
        aria-label="Input mode"
        selectedKey={mode}
        onSelectionChange={(key) => {
          setMode(key as "sentence" | "paragraph");
          setValue("");
        }}
        variant="bordered"
        color="primary"
      >
        <Tab key="sentence" title="Single Sentence" />
        <Tab key="paragraph" title="Paragraph" />
      </Tabs>

      {/* Textarea for input */}
      <Textarea
        label={
          isParagraph
            ? "Enter a paragraph (multiple sentences)"
            : "Enter an English sentence"
        }
        placeholder={
          isParagraph
            ? 'e.g. "The sun rose slowly. Birds began to sing. A new day had started."'
            : 'e.g. "The cake was eaten by the children in the garden."'
        }
        value={value}
        onValueChange={setValue}
        minRows={isParagraph ? 5 : 3}
        variant="bordered"
        classNames={{ label: "text-lg font-semibold" }}
      />

      <div className="flex gap-3">
        {/* Parse button */}
        <Button
          color="primary"
          onPress={handleParse}
          isDisabled={!value.trim() || isLoading}
          isLoading={isLoading}
        >
          {isParagraph ? "Parse Paragraph" : "Parse Sentence"}
        </Button>

        {/* Clear button */}
        <Button
          variant="flat"
          onPress={() => setValue("")}
          isDisabled={!value}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
