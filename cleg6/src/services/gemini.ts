// src/services/gemini.ts

export interface LessonParams {
  actflMode: string;
  skill: string;
  level: string;
  theme: string;
  functions: string;
  time?: string;
  language: string;
  stateStandards?: string;
}

export interface LessonResponse {
  teacherGuideHtml: string;
  studentPacketHtml: string;
  // Keep for later if you add image support in the Netlify function
  coverImageBase64?: string;
}

/**
 * Calls your Netlify Function (server-side) which calls Gemini.
 * Endpoint: /.netlify/functions/gemini
 */
export async function generateLesson(params: LessonParams): Promise<LessonResponse> {
  const textPrompt = `
Return ONLY a valid JSON object. No markdown. No code fences. No commentary. No extra keys.

You are generating a World Language lesson packet for a ${params.language} class.

Parameters:
- ACTFL Communication Mode: ${params.actflMode}
- Primary Skill: ${params.skill}
- Proficiency Level: ${params.level}
- Theme/Context: ${params.theme}
- Target Functions: ${params.functions}
${params.stateStandards ? `- Specific State Standards: ${params.stateStandards}` : ""}
${params.time ? `- Suggested Time: ${params.time}` : ""}

The JSON MUST have exactly two keys:
1) "teacherGuideHtml": A detailed teacher guide written entirely in English as a SINGLE HTML string.
2) "studentPacketHtml": A printable 2-page student-facing packet written entirely in ${params.language} as a SINGLE HTML string.

PRINTING RULES (IMPORTANT):
- Output clean semantic HTML with minimal inline styles.
- Use <h1>, <h2>, <p>, <ol>, <ul>, <li>, <table> where helpful.
- Insert a page break between pages using: <div class="page-break"></div>
- Do NOT include any <script> tags.
- Do NOT include markdown.
- Student packet must look like a worksheet: clear sections, numbered tasks, space for answers.
`.trim();

  const res = await fetch("/.netlify/functions/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ textPrompt }),
  });

  const rawText = await res.text();

  let data: any = {};
  try {
    data = JSON.parse(rawText);
  } catch {
    // If the function returned something unexpected, show it
    throw new Error(`Server returned non-JSON:\n${rawText.slice(0, 600)}`);
  }

  if (!res.ok) {
    throw new Error(data?.error || `Server request failed (${res.status})`);
  }

  if (!data.teacherGuideHtml || !data.studentPacketHtml) {
    throw new Error("Server returned invalid lesson payload (missing teacherGuideHtml/studentPacketHtml).");
  }

  return data as LessonResponse;
}

/**
 * “Save as PDF” without libraries:
 * - Opens a new window
 * - Injects printable HTML + CSS
 * - Calls print() so user can choose “Save as PDF”
 */
export function printStudentPacket(studentPacketHtml: string, title = "Student Packet") {
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;

  w.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @page { margin: 0.5in; }
          body {
            font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
            color: #111;
            line-height: 1.35;
          }
          h1 { font-size: 18pt; margin: 0 0 10px; }
          h2 { font-size: 13pt; margin: 16px 0 8px; }
          p { margin: 0 0 10px; }
          ul, ol { margin: 0 0 10px 20px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          td, th { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
          .page-break { page-break-before: always; }
          .answer-line { display: block; border-bottom: 1px solid #999; height: 14px; margin: 8px 0; }
        </style>
      </head>
      <body>
        ${studentPacketHtml}
      </body>
    </html>
  `);

  w.document.close();
  w.focus();
  w.print();
}

/** Tiny helper so the print window title can't break HTML */
function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}