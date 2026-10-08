import { NextRequest, NextResponse } from "next/server";

const MAX_CHARS = 500;
const MODEL_ID = "eleven_multilingual_v2";

export async function POST(req: NextRequest) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 500 });
  }

  const { text, voiceId } = (await req.json().catch(() => ({}))) as {
    text?: string;
    voiceId?: string;
  };

  const clean = text?.trim() ?? "";
  if (!clean) return NextResponse.json({ error: "Type something first" }, { status: 400 });
  if (clean.length > MAX_CHARS) {
    return NextResponse.json({ error: `Keep it under ${MAX_CHARS} characters` }, { status: 400 });
  }
  if (!voiceId || !/^[A-Za-z0-9]+$/.test(voiceId)) {
    return NextResponse.json({ error: "Pick a voice" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({ text: clean, model_id: MODEL_ID }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    console.error("ElevenLabs error", res.status, detail);
    return NextResponse.json({ error: "ElevenLabs couldn't generate that" }, { status: 502 });
  }

  return new NextResponse(res.body, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
