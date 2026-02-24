"use client";

/**
 * SentenceInput.tsx
 *
 * A controlled textarea component that lets users type or paste English
 * sentences. On submit it calls the provided `onParse` callback.
 * Built with HeroUI (NextUI v2) Textarea and Button components.
 */

import React, { useState } from "react";
import { Textarea, Button } from "@heroui/react";

/** Props accepted by the SentenceInput component. */
interface SentenceInputProps {
  /** Callback invoked with the trimmed sentence when the user clicks Parse. */
  onParse: (sentence: string) => void;
  /** When true the parse button shows a loading spinner and is disabled. */
  isLoading?: boolean;
}

export default function SentenceInput({ onParse, isLoading }: SentenceInputProps) {
  const [value, setValue] = useState("");

  /** Handle the parse action. */
  const handleParse = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onParse(trimmed);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Textarea for sentence input */}
      <Textarea
        label="Enter an English sentence"
        placeholder='e.g. "The cake was eaten by the children in the garden."'
        value={value}
        onValueChange={setValue}
        minRows={3}
        variant="bordered"
        classNames={{ label: "text-lg font-semibold" }}
      />

      <div className="flex gap-3">
        {/* Parse button */}
        <Button color="primary" onPress={handleParse} isDisabled={!value.trim() || isLoading} isLoading={isLoading}>
          Parse Sentence
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
