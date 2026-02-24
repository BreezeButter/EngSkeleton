# English Sentence Parser

A **Next.js 14+** web application built with **HeroUI (NextUI v2)** and **TypeScript** that parses English sentences into grammatical components.

## Features

- **Sentence Input** – Type or paste any English sentence.
- **Grammatical Parsing** – Automatically extracts Subject (S), Verb (V), Object (O), Tense, Voice, and Phrases.
- **Passive / Active Voice Highlighting** – Passive voice is visually distinguished with a red badge.
- **Color-Coded Components** – Each grammatical component (S, V, O, Phrases) has its own color for quick scanning.
- **Dual View** – Switch between **Card View** and **Table View** for parsed results.
- **JSON Export** – Download all parsed results as a `.json` file.

## Project Structure

```
├── app/                  # Next.js App Router pages & layouts
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
│   └── parseSentence.ts  # Heuristic English sentence parser
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
3. The parser extracts:
   - **Subject (S)** – words before the main verb
   - **Verb (V)** – the verb phrase (including auxiliaries)
   - **Object (O)** – words after the verb phrase
   - **Tense** – detected tense (e.g., Present Simple, Past Perfect)
   - **Voice** – Active or Passive (form of "be" + past participle)
   - **Phrases** – prepositional/adverbial phrases
4. Results appear in color-coded Card or Table view.
5. Click **Export as JSON** to download results.

## Technologies

- [Next.js](https://nextjs.org/) – React framework with App Router
- [HeroUI (NextUI v2)](https://heroui.com/) – Modern React component library
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) – Type-safe JavaScript
- [Framer Motion](https://www.framer.com/motion/) – Animation library (required by HeroUI)
