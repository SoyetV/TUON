# TUON

TUON is a gamified AI study app built with React and Vite.

## Run Locally

```powershell
npm install
npm run dev
```

## Gemini API Key

Create a `.env` file in this folder and add your Google AI Studio API key:

```env
VITE_GEMINI_API_KEY=your_api_key_here
VITE_GEMINI_MODEL=gemini-2.5-flash
```

Restart `npm run dev` after changing `.env`.

The quiz generator uses Gemini through Google AI Studio. Because this is a browser app, any Vite environment variable included in the frontend can be viewed by users in production builds.

## PDF Extraction

The Study Session PDF tab uses `pdfjs-dist` in the browser to extract selectable text from uploaded PDFs. Scanned image-only PDFs need OCR before useful quiz generation.
