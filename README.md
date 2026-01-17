# DocuMind 🧠

**DocuMind** is a SaaS application that uses Google's Gemini 1.5 Flash to help users summarize, rewrite, and analyze documents in seconds. Built with **Next.js 16**, it features real-time AI streaming, PDF text extraction, and a robust rate-limiting system.

![Project Screenshot](https://via.placeholder.com/1200x600?text=DocuMind+Dashboard+Preview)
_(Replace this link with your actual screenshot from the landing page)_

## 🚀 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **AI Model:** [Google Gemini 1.5 Flash](https://deepmind.google/technologies/gemini/) (via Vercel AI SDK)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Neon)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Rate Limiting:** [Upstash Redis](https://upstash.com/)
- **File Parsing:** `pdf-parse` (Server-side PDF extraction)

## ✨ Key Features

- **📄 PDF & Text Support:** Upload PDF files or write generic text. The app automatically parses binary files into editable text.
- **⚡ Real-Time Streaming:** AI responses stream instantly to the client, providing a "chat-like" experience without loading spinners.
- **🛡️ Rate Limiting:** Built-in protection using Redis to limit free users to 3 generations per day.
- **📝 Live Editor:** Edit original documents and AI outputs side-by-side. Changes are saved to the database automatically.
- **🔐 Secure Auth:** Full authentication flow (Sign Up, Login, Protected Routes) using Clerk.
- **📱 Responsive:** Fully responsive dashboard and landing page designed with a mobile-first approach.

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.com/) account
- A [Neon](https://neon.tech/) (Postgres) account
- A [Google AI Studio](https://aistudio.google.com/) API Key
- An [Upstash](https://upstash.com/) (Redis) account

### 1. Clone the repository

```bash
git clone [https://github.com/yourusername/documind.git](https://github.com/yourusername/documind.git)
cd documind
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory and add the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_WEBHOOK_SECRET=your-clerk-webhook-secret

# Neon (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# Upstash Redis
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token

# Google AI Studio
GOOGLE_API_KEY=your-google-api-key
```

### 4. Database Migration

```bash
npm run db:push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Important Configuration Note

To hadle PDF parsing on the server without building errors, `next.config.js` must include `pdf-parse` in `serverExternalPackages`:

```js
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  serverExternalPackages: ["pdf-parse"],
};
```
