import { llmIndexText, plainTextResponse } from "../../lib/llm";

export const dynamic = "force-static";

export function GET(): Response {
  return plainTextResponse(llmIndexText());
}
