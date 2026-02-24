# English Sentence Parser

A **Next.js 14+** web application built with **HeroUI (NextUI v2)** and **TypeScript** that parses English sentences into grammatical components.

## Features

- **Gemini-Powered Parsing** – Uses Google Gemini to decompose sentences into grammatical components (falls back to a local heuristic parser when no API key is configured).
- **Sentence Input** – Type or paste any English sentence.
- **Grammatical Parsing** – Automatically extracts Subject (S), Verb (V), Object (O), Tense, Voice, and Phrases.
- **Passive / Active Voice Highlighting** – Passive voice is visually distinguished with a red badge.
- **Color-Coded Components** – Each grammatical component (S, V, O, Phrases) has its own color for quick scanning.
- **Dual View** – Switch between **Card View** and **Table View** for parsed results.
- **JSON Export** – Download all parsed results as a `.json` file.

## Project Structure

```
├── app/                  # Next.js App Router pages & layouts
│   ├── api/
│   │   └── parse/
│   │       └── route.ts  # POST endpoint – Gemini-powered sentence parser
│   ├── globals.css       # Global styles & Tailwind/HeroUI config
│   ├── layout.tsx        # Root layout with HeroUI Provider
│   └── page.tsx          # Home page (main UI)
├── components/           # Reusable React components
│   ├── ExportButton.tsx  # JSON export download button
│   ├── ParsedResultCard.tsx  # Card-based result display
│   ├── ParsedResultTable.tsx # Table-based result display
│   ├── Providers.tsx     # HeroUI context provider wrapper
│   └── SentenceInput.tsx # Sentence input textarea + parse button
├── lib/                  # Helper / utility modules
│   ├── config.ts         # Environment config (Gemini API key)
│   └── parseSentence.ts  # Heuristic English sentence parser (fallback)
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies & scripts
└── README.md             # This file
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** (or yarn/pnpm)

### Installation

```bash
# Clone the repository
git clone https://github.com/BreezeButter/EngSkeleton.git
cd EngSkeleton

# Install dependencies
npm install
```

### Configuration

Copy the example environment file and add your Gemini API key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your key:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).

> **Note:** The app works without an API key — it will fall back to the built-in heuristic parser.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## How It Works

1. Enter an English sentence in the text area.
2. Click **Parse Sentence**.
3. The sentence is sent to the `/api/parse` endpoint which uses Google Gemini to extract:
   - **Subject (S)** – the subject of the sentence
   - **Verb (V)** – the verb phrase (including auxiliaries)
   - **Object (O)** – the object of the sentence
   - **Tense** – detected tense (e.g., Present Simple, Past Perfect)
   - **Voice** – Active or Passive
   - **Phrases** – prepositional/adverbial phrases
4. If the Gemini API key is not configured or the call fails, the app falls back to a local heuristic parser.
5. Results appear in color-coded Card or Table view.
6. Click **Export as JSON** to download results.

## Technologies

- [Next.js](https://nextjs.org/) – React framework with App Router
- [Google Generative AI](https://ai.google.dev/) – Gemini LLM for sentence decomposition
- [HeroUI (NextUI v2)](https://heroui.com/) – Modern React component library
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) – Type-safe JavaScript
- [Framer Motion](https://www.framer.com/motion/) – Animation library (required by HeroUI)
