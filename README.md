# Read It Back

Small Next.js app that turns text into speech with the ElevenLabs API. Pick a voice, type up to 500 characters, and play or download the MP3.

The API key stays on the server. The browser only talks to two routes:

- `GET /api/voices` lists the voices on your ElevenLabs account
- `POST /api/tts` sends text to ElevenLabs and streams the audio back

## Run it

```bash
npm install
cp .env.example .env.local   # then paste your ElevenLabs API key
npm run dev
```

Open http://localhost:3000.

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4.
