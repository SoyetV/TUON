const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";

function parseJsonFromText(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("[");
  const end = clean.lastIndexOf("]");
  const json = start >= 0 && end >= start ? clean.slice(start, end + 1) : clean;
  return JSON.parse(json);
}

function normalizeQuestions(value) {
  if (!Array.isArray(value)) throw new Error("Gemini did not return a question array.");

  return value.map((q, index) => {
    const options = Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [];
    const correct = Number(q.correct);

    if (!q.question || options.length !== 4 || !Number.isInteger(correct) || correct < 0 || correct > 3) {
      throw new Error(`Question ${index + 1} is missing required fields.`);
    }

    return {
      question: String(q.question),
      options,
      correct,
      explanation: String(q.explanation || "Review the related study notes for more context."),
    };
  });
}

export async function generateQuizWithGemini({ subjectTitle, notes, count }) {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Add your Google AI Studio key to a .env file and restart the dev server.");
  }

  const prompt = `Generate exactly ${count} multiple-choice quiz questions from these study notes.

Return only a JSON array. Do not include markdown fences, comments, or prose.

Required format:
[{"question":"...","options":["A text","B text","C text","D text"],"correct":0,"explanation":"..."}]

Rules:
- correct must be a number from 0 to 3.
- Each question must have exactly four options.
- Vary the correct option position.
- Test understanding, not memorization only.
- Keep explanations concise and useful.

Subject: ${subjectTitle}

Study notes:
${notes.slice(0, 12000)}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  return normalizeQuestions(parseJsonFromText(text));
}
