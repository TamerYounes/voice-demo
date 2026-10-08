import { NextResponse } from "next/server";

type Voice = { voice_id: string; name: string; category?: string };

export async function GET() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 500 });
  }

  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": key },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Couldn't load voices" }, { status: res.status });
  }

  const data: { voices: Voice[] } = await res.json();
  const voices = data.voices.map((v) => ({ id: v.voice_id, name: v.name }));
  return NextResponse.json({ voices });
}
