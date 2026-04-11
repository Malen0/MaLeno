/**
 * Optional local overrides — copy this file to `config.js` (gitignored).
 *
 * SECURITY: Do NOT put your Google AI Studio API key in any file served to the browser.
 * The portfolio uses a server-side proxy; set your real key in the project root `.env`:
 *   GOOGLE_AI_API_KEY=your_actual_key
 */
window.CHAT_CONFIG = {
  /** POST endpoint on this site that forwards to Gemini (default). */
  chatApiUrl: "/api/gemini/chat",
};
