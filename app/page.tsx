"use client";

import { useEffect, useRef, useState } from "react";

type Voice = { id: string; name: string };

const MAX_CHARS = 500;

export default function Home() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState("");
  const [text, setText] = useState("Hey, this is a quick demo I built with Next.js and the ElevenLabs API.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch("/api/voices")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setVoices(d.voices);
        if (d.voices[0]) setVoiceId(d.voices[0].id);
      })
      .catch((e) => setError(e.message || "Couldn't load voices"));
  }, []);

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Something went wrong");
      }
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
      requestAnimationFrame(() => audioRef.current?.play());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const tooLong = text.length > MAX_CHARS;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Read It Back</h1>
        <p className="text-neutral-400">Type something, pick a voice, and hear it read out loud.</p>
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-neutral-400">Voice</span>
        <select
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
          disabled={!voices.length}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none focus:border-neutral-500"
        >
          {!voices.length && <option>Loading voices…</option>}
          {voices.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="flex justify-between text-sm text-neutral-400">
          Text
          <span className={tooLong ? "text-red-400" : ""}>{text.length}/{MAX_CHARS}</span>
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="resize-y rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none focus:border-neutral-500"
        />
      </label>

      <button
        onClick={generate}
        disabled={loading || !voiceId || !text.trim() || tooLong}
        className="rounded-lg bg-white px-4 py-2.5 font-medium text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Generating…" : "Read it"}
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {audioUrl && (
        <div className="flex flex-col gap-2">
          <audio ref={audioRef} src={audioUrl} controls className="w-full" />
          <a href={audioUrl} download="speech.mp3" className="text-sm text-neutral-400 underline hover:text-neutral-200">
            Download MP3
          </a>
        </div>
      )}

      <footer className="pt-8 text-xs text-neutral-500">
        Built by Tamer Younes with Next.js and the ElevenLabs text-to-speech API.
      </footer>
    </main>
  );
}
