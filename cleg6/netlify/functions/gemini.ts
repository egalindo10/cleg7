import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing GEMINI_API_KEY" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const textPrompt = body?.textPrompt;
    if (!textPrompt) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing textPrompt" }) };
    }

    const model = "gemini-2.5-flash";

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=` +
      encodeURIComponent(apiKey);

    const payload = {
      contents: [{ parts: [{ text: textPrompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: "Gemini request failed", gemini: data }),
      };
    }

    // Gemini returns JSON-as-text inside candidates[0].content.parts[*].text
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((p: any) => p.text || "").join("").trim();

    if (!text) {
      return { statusCode: 500, body: JSON.stringify({ error: "No text in Gemini response", gemini: data }) };
    }

    // Parse the JSON your prompt asked for
    const lesson = JSON.parse(text);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lesson),
    };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server error", message: e?.message || String(e) }) };
  }
};