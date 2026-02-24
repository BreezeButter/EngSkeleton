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

/** A single word with its part-of-speech label. */
export interface WordTag {
  /** The original word token. */
  word: string;
  /**
   * Part-of-speech abbreviation:
   * NOUN, VERB, AUX, ADJ, ADV, DET, PRON, PREP, CONJ, PUNCT, NUM, or OTHER.
   */
  pos: string;
}

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
  /** Per-word part-of-speech tags. */
  wordTags: WordTag[];
  /** Grammar suggestions and recommendations for the sentence. */
  grammarSuggestions: string[];
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

/** Determiners (articles, demonstratives, possessives, quantifiers). */
const DETERMINERS = new Set([
  "the", "a", "an", "this", "that", "these", "those",
  "my", "your", "his", "her", "its", "our", "their",
  "some", "any", "all", "both", "each", "every", "no", "another", "other",
  "many", "much", "few", "little", "more", "most", "less", "least",
  "several", "enough", "either", "neither",
]);

/** Personal, reflexive, relative, and interrogative pronouns. */
const PRONOUNS = new Set([
  "i", "me", "you", "he", "him", "she", "her", "it",
  "we", "us", "they", "them", "who", "whom", "whose",
  "which", "myself", "yourself", "himself", "herself",
  "itself", "ourselves", "yourselves", "themselves",
  "someone", "anyone", "everyone", "no one", "nobody",
  "something", "anything", "everything", "nothing",
  "somebody", "anybody", "everybody",
]);

/** Coordinating and subordinating conjunctions. */
const CONJUNCTIONS = new Set([
  "and", "but", "or", "nor", "for", "yet", "so",
  "because", "although", "though", "while", "when", "if", "unless",
  "until", "since", "as", "after", "before", "once", "whether",
  "whereas", "wherever", "whenever", "however", "therefore",
  "nevertheless", "nonetheless", "furthermore", "moreover",
]);

/** Common adverbs (non-derivational; -ly words are detected by suffix). */
const ADVERBS = new Set([
  "very", "quite", "rather", "just", "already", "still", "always",
  "never", "often", "sometimes", "usually", "generally", "frequently",
  "here", "there", "now", "then", "soon", "today", "yesterday",
  "tomorrow", "not", "also", "too", "even", "only", "well", "almost",
  "again", "away", "back", "far", "fast", "hard", "high", "late",
  "long", "loud", "low", "more", "most", "much", "near", "next",
  "once", "right", "still", "straight", "together",
]);

/** Adjective-like endings used for heuristic POS detection. */
const ADJ_SUFFIXES = [
  "ful", "ous", "ious", "eous", "ual", "ial", "ical",
  "ic", "tic", "atic", "able", "ible", "ive", "ative",
  "itive", "less", "like", "al", "an",
  "ish", "esque", "ward",
];

/** Common number words. */
const NUMBER_WORDS = new Set([
  "zero", "one", "two", "three", "four", "five", "six", "seven",
  "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",
  "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
  "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
  "hundred", "thousand", "million", "billion", "first", "second",
  "third", "fourth", "fifth",
]);

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
// Word-level POS tagging
// ---------------------------------------------------------------------------

/**
 * Assigns a part-of-speech (POS) tag to each token in the sentence.
 * Uses heuristic rules; works best for simple to moderately complex sentences.
 *
 * POS labels: DET, PRON, AUX, VERB, ADJ, ADV, PREP, CONJ, NUM, PUNCT, OTHER.
 */
export function tagWords(sentence: string): WordTag[] {
  const tokens = sentence.trim().split(/\s+/);
  const result: WordTag[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i];
    // Strip trailing punctuation for classification, keep original word
    const clean = raw.replace(/[^a-zA-Z0-9'-]/g, "");
    const punct = raw.replace(/[a-zA-Z0-9'-]/g, "");
    const lower = clean.toLowerCase();

    // Push punctuation tokens separately when they stand alone
    if (!clean) {
      result.push({ word: raw, pos: "PUNCT" });
      continue;
    }

    let pos: string;

    // Pure numeric or ordinal
    if (/^\d+$/.test(clean) || NUMBER_WORDS.has(lower)) {
      pos = "NUM";
    } else if (DETERMINERS.has(lower)) {
      pos = "DET";
    } else if (PRONOUNS.has(lower)) {
      pos = "PRON";
    } else if (AUXILIARIES.includes(lower)) {
      pos = "AUX";
    } else if (PREPOSITIONS.includes(lower)) {
      pos = "PREP";
    } else if (CONJUNCTIONS.has(lower)) {
      pos = "CONJ";
    } else if (ADVERBS.has(lower) || lower.endsWith("ly")) {
      pos = "ADV";
    } else if (ADJ_SUFFIXES.some((s) => lower.endsWith(s)) && lower.length > 3) {
      // Heuristic: adjective suffixes; guard against matching short words
      pos = "ADJ";
    } else if (
      lower.endsWith("ing") ||
      lower.endsWith("ed") ||
      lower.endsWith("en")
    ) {
      pos = "VERB";
    } else {
      // Default to NOUN
      pos = "NOUN";
    }

    // If trailing punctuation exists, push token without it, then punctuation
    if (punct) {
      result.push({ word: clean, pos });
      result.push({ word: punct, pos: "PUNCT" });
    } else {
      result.push({ word: raw, pos });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Grammar checking
// ---------------------------------------------------------------------------

/**
 * Performs lightweight grammar checks on a sentence and returns a list of
 * human-readable suggestions.
 */
export function checkGrammar(
  sentence: string,
  voice: "Active" | "Passive",
  wordCount: number,
): string[] {
  const suggestions: string[] = [];
  const trimmed = sentence.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).map((w) => w.toLowerCase().replace(/[^a-z]/g, ""));

  // 1. Terminal punctuation
  if (!/[.!?]$/.test(trimmed)) {
    suggestions.push(
      "Consider ending the sentence with proper punctuation (., !, or ?).",
    );
  }

  // 2. Passive voice recommendation
  if (voice === "Passive") {
    suggestions.push(
      "This sentence is in passive voice. Consider rewriting in active voice for clarity (e.g., 'The dog bit the man' instead of 'The man was bitten by the dog').",
    );
  }

  // 3. Very long sentence
  if (wordCount > 30) {
    suggestions.push(
      `This sentence is quite long (${wordCount} words). Consider breaking it into shorter sentences for readability.`,
    );
  }

  // 4. Repeated consecutive words
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i] && words[i] === words[i + 1]) {
      suggestions.push(
        `Possible duplicate word: "${words[i]} ${words[i + 1]}". Check for accidental repetition.`,
      );
      break;
    }
  }

  // 5. Common subject-verb agreement issues
  const svMismatches: [string, string, string][] = [
    ["i", "are", "am"],
    ["i", "is", "am"],
    ["he", "are", "is"],
    ["she", "are", "is"],
    ["it", "are", "is"],
    ["we", "is", "are"],
    ["they", "is", "are"],
    ["you", "is", "are"],
    ["he", "have", "has"],
    ["she", "have", "has"],
    ["it", "have", "has"],
    ["i", "has", "have"],
    ["we", "has", "have"],
    ["they", "has", "have"],
    ["you", "has", "have"],
  ];
  for (const [subj, wrong, correct] of svMismatches) {
    if (lower.includes(`${subj} ${wrong}`)) {
      suggestions.push(
        `Possible subject-verb agreement issue: "${subj} ${wrong}" should likely be "${subj} ${correct}".`,
      );
    }
  }

  // 6. Double negatives
  const negPairs = [
    ["not", "no"],
    ["don't", "no"],
    ["doesn't", "no"],
    ["didn't", "no"],
    ["never", "no"],
    ["not", "nothing"],
    ["don't", "nothing"],
  ];
  for (const [a, b] of negPairs) {
    if (lower.includes(a) && lower.includes(b)) {
      suggestions.push(
        `Possible double negative detected ("${a}" and "${b}"). Double negatives can be confusing; consider revising.`,
      );
      break;
    }
  }

  return suggestions;
}

// ---------------------------------------------------------------------------
// Paragraph parsing
// ---------------------------------------------------------------------------

/**
 * Splits a paragraph of text into individual sentences.
 * Sentences are delimited by `.`, `!`, or `?` followed by whitespace or end
 * of string.
 */
export function splitIntoSentences(paragraph: string): string[] {
  // Split on sentence-ending punctuation while keeping the punctuation
  const raw = paragraph.trim().match(/[^.!?]*[.!?]+[\s]*/g) ?? [paragraph.trim()];
  return raw.map((s) => s.trim()).filter((s) => s.length > 0);
}

/**
 * Parses every sentence in a paragraph and returns an array of
 * `ParsedSentence` objects—one per detected sentence.
 *
 * @param paragraph - One or more sentences as a block of text.
 * @returns Array of parsed sentences in order of appearance.
 */
export function parseParagraph(paragraph: string): ParsedSentence[] {
  const sentences = splitIntoSentences(paragraph);
  return sentences.map((s) => parseSentence(s));
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
      wordTags: [],
      grammarSuggestions: [],
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

  // Per-word POS tagging and grammar checking
  const wordTags = tagWords(trimmed);
  const grammarSuggestions = checkGrammar(trimmed, voice, words.length);

  return {
    original: trimmed,
    subject,
    verb,
    object,
    tense,
    voice,
    phrases,
    wordTags,
    grammarSuggestions,
  };
}
