/**
 * parseSentence.ts
 *
 * Utility module that parses an English sentence into grammatical components:
 * Subject (S), Verb (V), Object (O), Tense, Voice, and Phrases.
 *
 * This is a heuristic-based parser suitable for simple to moderately complex
 * English sentences. It does not rely on NLP libraries to keep the project
 * lightweight and runnable out-of-the-box.
 */

/** Result type returned by the sentence parser. */
export interface ParsedSentence {
  /** The original sentence that was parsed. */
  original: string;
  /** The subject portion of the sentence. */
  subject: string;
  /** The main verb (or verb phrase) of the sentence. */
  verb: string;
  /** The object portion of the sentence (if any). */
  object: string;
  /** Detected tense of the sentence. */
  tense: string;
  /** Whether the sentence is in active or passive voice. */
  voice: "Active" | "Passive";
  /** Prepositional or adverbial phrases extracted from the sentence. */
  phrases: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Common auxiliary / "be" verbs used to detect passive voice and tenses. */
const BE_FORMS = [
  "is",
  "am",
  "are",
  "was",
  "were",
  "been",
  "being",
  "be",
];

/** Common modal and auxiliary verbs. */
const AUXILIARIES = [
  "will",
  "shall",
  "would",
  "should",
  "could",
  "can",
  "may",
  "might",
  "must",
  "has",
  "have",
  "had",
  "do",
  "does",
  "did",
  ...BE_FORMS,
];

/** Prepositions that typically start prepositional phrases. */
const PREPOSITIONS = [
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "from",
  "to",
  "into",
  "onto",
  "upon",
  "over",
  "under",
  "along",
  "across",
  "around",
  "near",
  "beside",
  "behind",
  "without",
  "within",
];

/**
 * Checks whether a word looks like a past participle (rough heuristic).
 * Past participles typically end in -ed, -en, -n, -t, or are irregular.
 */
function looksLikePastParticiple(word: string): boolean {
  const lower = word.toLowerCase();
  // Common irregular past participles
  const irregulars = new Set([
    "been",
    "done",
    "gone",
    "seen",
    "taken",
    "given",
    "written",
    "driven",
    "eaten",
    "fallen",
    "chosen",
    "broken",
    "spoken",
    "frozen",
    "stolen",
    "known",
    "shown",
    "grown",
    "thrown",
    "drawn",
    "blown",
    "worn",
    "torn",
    "born",
    "sworn",
    "hidden",
    "ridden",
    "bitten",
    "forgotten",
    "begun",
    "sung",
    "rung",
    "drunk",
    "sunk",
    "swum",
    "run",
    "come",
    "become",
    "held",
    "told",
    "sold",
    "found",
    "brought",
    "bought",
    "thought",
    "caught",
    "taught",
    "fought",
    "sought",
    "sent",
    "spent",
    "built",
    "lent",
    "lost",
    "left",
    "felt",
    "kept",
    "slept",
    "met",
    "led",
    "read",
    "said",
    "made",
    "paid",
    "laid",
    "put",
    "set",
    "cut",
    "hit",
    "shut",
    "let",
    "hurt",
  ]);
  if (irregulars.has(lower)) return true;
  if (lower.endsWith("ed")) return true;
  if (lower.endsWith("en")) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Voice detection
// ---------------------------------------------------------------------------

/**
 * Detects whether the sentence is in passive voice.
 * Pattern: form of "be" + past participle (+ optional "by" agent).
 */
function detectVoice(words: string[]): "Active" | "Passive" {
  const lower = words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ""));
  for (let i = 0; i < lower.length - 1; i++) {
    if (BE_FORMS.includes(lower[i]) && looksLikePastParticiple(lower[i + 1])) {
      return "Passive";
    }
  }
  return "Active";
}

// ---------------------------------------------------------------------------
// Tense detection
// ---------------------------------------------------------------------------

/**
 * Determines the grammatical tense of the sentence (simplified).
 */
function detectTense(words: string[]): string {
  const lower = words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ""));

  // Future tenses
  if (lower.includes("will") || lower.includes("shall")) {
    if (lower.includes("been") || lower.includes("have")) {
      return "Future Perfect";
    }
    if (lower.includes("be") && words.some((w) => w.toLowerCase().endsWith("ing"))) {
      return "Future Continuous";
    }
    return "Future Simple";
  }

  // Perfect tenses
  if (lower.includes("has") || lower.includes("have")) {
    if (lower.includes("been") && words.some((w) => w.toLowerCase().endsWith("ing"))) {
      return "Present Perfect Continuous";
    }
    return "Present Perfect";
  }

  if (lower.includes("had")) {
    if (lower.includes("been") && words.some((w) => w.toLowerCase().endsWith("ing"))) {
      return "Past Perfect Continuous";
    }
    return "Past Perfect";
  }

  // Continuous tenses
  const hasBePresent = lower.includes("is") || lower.includes("am") || lower.includes("are");
  const hasBePast = lower.includes("was") || lower.includes("were");
  const hasIng = words.some((w) => w.toLowerCase().endsWith("ing") && w.length > 4);

  if (hasBePresent && hasIng) return "Present Continuous";
  if (hasBePast && hasIng) return "Past Continuous";

  // Simple past indicators
  if (
    lower.includes("did") ||
    hasBePast ||
    words.some((w) => {
      const l = w.toLowerCase().replace(/[^a-z]/g, "");
      return l.endsWith("ed") && !AUXILIARIES.includes(l);
    })
  ) {
    return "Past Simple";
  }

  // Default
  return "Present Simple";
}

// ---------------------------------------------------------------------------
// Phrase extraction
// ---------------------------------------------------------------------------

/**
 * Extracts prepositional phrases from the sentence.
 * A phrase starts at a preposition and runs until the next preposition,
 * punctuation, or end of sentence.
 */
function extractPhrases(words: string[]): { phrases: string[]; remaining: string[] } {
  const phrases: string[] = [];
  const remaining: string[] = [];
  let inPhrase = false;
  let currentPhrase: string[] = [];

  for (const word of words) {
    const lower = word.toLowerCase().replace(/[^a-z]/g, "");
    if (PREPOSITIONS.includes(lower)) {
      // Save any in-progress phrase
      if (inPhrase && currentPhrase.length > 0) {
        phrases.push(currentPhrase.join(" "));
      }
      currentPhrase = [word];
      inPhrase = true;
    } else if (inPhrase) {
      currentPhrase.push(word);
    } else {
      remaining.push(word);
    }
  }

  if (inPhrase && currentPhrase.length > 0) {
    phrases.push(currentPhrase.join(" "));
  }

  return { phrases, remaining };
}

// ---------------------------------------------------------------------------
// SVO extraction
// ---------------------------------------------------------------------------

/**
 * Splits the remaining (non-phrase) words into Subject, Verb, and Object.
 * Uses a simple heuristic: words before the first verb form are the subject,
 * verb-related words form the verb phrase, and the rest is the object.
 */
function extractSVO(words: string[]): { subject: string; verb: string; object: string } {
  if (words.length === 0) {
    return { subject: "", verb: "", object: "" };
  }

  const lower = words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ""));

  // Find the index of the first verb-like word
  let verbStart = -1;
  let verbEnd = -1;

  for (let i = 0; i < lower.length; i++) {
    const w = lower[i];
    const isAux = AUXILIARIES.includes(w);
    const isVerbLike =
      isAux ||
      w.endsWith("ed") ||
      w.endsWith("ing") ||
      w.endsWith("es") ||
      w.endsWith("s");

    if (isVerbLike && verbStart === -1) {
      // Don't start the verb at the very first word unless it's clearly a verb
      if (i === 0 && !isAux) continue;
      verbStart = i;
    }

    if (verbStart !== -1) {
      if (isVerbLike || isAux || looksLikePastParticiple(w)) {
        verbEnd = i;
      } else {
        break;
      }
    }
  }

  // Fallback: if we couldn't find a verb, treat the second word as the verb
  if (verbStart === -1 && words.length >= 2) {
    verbStart = 1;
    verbEnd = 1;
  } else if (verbStart === -1) {
    return { subject: words.join(" "), verb: "", object: "" };
  }

  const subject = words.slice(0, verbStart).join(" ") || words[0] || "";
  const verb = words.slice(verbStart, verbEnd + 1).join(" ");
  const object = words.slice(verbEnd + 1).join(" ");

  return {
    subject: subject || (verbStart === 0 ? "" : words[0]),
    verb,
    object,
  };
}

// ---------------------------------------------------------------------------
// Main parse function
// ---------------------------------------------------------------------------

/**
 * Parses an English sentence into its grammatical components.
 *
 * @param sentence - The English sentence to parse.
 * @returns A `ParsedSentence` object containing the breakdown.
 */
export function parseSentence(sentence: string): ParsedSentence {
  const trimmed = sentence.trim();
  if (!trimmed) {
    return {
      original: "",
      subject: "",
      verb: "",
      object: "",
      tense: "Unknown",
      voice: "Active",
      phrases: [],
    };
  }

  // Tokenize
  const words = trimmed.split(/\s+/);

  // Detect voice and tense from the full sentence
  const voice = detectVoice(words);
  const tense = detectTense(words);

  // Extract prepositional phrases, then determine SVO from the remainder
  const { phrases, remaining } = extractPhrases(words);
  const { subject, verb, object } = extractSVO(remaining);

  return {
    original: trimmed,
    subject,
    verb,
    object,
    tense,
    voice,
    phrases,
  };
}
