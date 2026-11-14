import { internal } from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";

/**
 * POSTs JSON to a provider with a 5 second timeout. A non-2xx answer or a
 * network failure becomes an AppError whose cause names the provider and status.
 */
export async function postJson(
  provider: string,
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<Result<null>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).slice(0, 300);
      return err(internal(new Error(`${provider} responded ${response.status}: ${detail}`)));
    }
    return ok(null);
  } catch (error) {
    return err(internal(new Error(`${provider} request failed`, { cause: error })));
  }
}
