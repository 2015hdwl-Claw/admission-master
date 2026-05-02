/**
 * Shared AI API helper with retry logic and fallback support.
 * Centralizes GLM API calls so all routes benefit from consistent error handling.
 */

const AI_API_BASE =
  process.env.AI_API_BASE_URL ||
  process.env.NEXT_PUBLIC_AI_BASE_URL ||
  'https://open.bigmodel.cn/api/paas/v4/';
const AI_API_KEY =
  process.env.AI_API_KEY ||
  process.env.NEXT_PUBLIC_AI_API_KEY ||
  '';
const AI_MODEL =
  process.env.AI_MODEL ||
  process.env.NEXT_PUBLIC_AI_MODEL ||
  'glm-4.7-flash';

/** Models to try in order of preference */
const MODEL_FALLBACKS = [AI_MODEL, 'glm-4.5-air', 'glm-4-flash'];

const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 8000; // Vercel Serverless has 10s limit, leave buffer for retry logic

export interface AIRequestOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  timeoutMs?: number;
}

export interface AIResponse {
  ok: boolean;
  content: string | null;
  error: string | null;
  usedFallback: boolean;
  isRateLimited: boolean;
  retryCount?: number;
  responseTime?: number;
}

/**
 * Call the AI API with retry and model fallback logic.
 * Returns structured result instead of throwing, so callers can handle fallbacks.
 */
export async function callAI(options: AIRequestOptions): Promise<AIResponse> {
  const startTime = Date.now();

  if (!AI_API_KEY) {
    return {
      ok: false,
      content: null,
      error: 'AI API key not configured',
      usedFallback: false,
      isRateLimited: false,
      responseTime: Date.now() - startTime,
    };
  }

  const messages: Array<{ role: string; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: options.userPrompt });

  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;

  // Try each model
  for (const model of MODEL_FALLBACKS) {
    const result = await tryModel(model, messages, options.temperature ?? 0.5, timeoutMs, startTime);
    if (result.ok) return result;

    // If rate limited on this model, try next model
    if (result.isRateLimited) {
      console.error(`AI model ${model} rate limited, trying next model`);
      continue;
    }

    // Other error (model not found, balance insufficient) - try next model
    console.error(`AI model ${model} error: ${result.error}`);
    continue;
  }

  // All models failed - try retry on original model once
  const retryResult = await tryModel(AI_MODEL, messages, options.temperature ?? 0.5, timeoutMs, startTime);
  if (retryResult.ok) {
    return { ...retryResult, usedFallback: true };
  }

  return {
    ok: false,
    content: null,
    error: retryResult.error ?? 'All AI models unavailable',
    usedFallback: false,
    isRateLimited: retryResult.isRateLimited,
    responseTime: Date.now() - startTime,
  };
}

async function tryModel(
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number,
  timeoutMs: number,
  startTime: number,
): Promise<AIResponse> {
  let lastError: string | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAY_MS);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${AI_API_BASE}chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: { type: 'json_object' },
          temperature,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        const errorCode = extractErrorCode(errBody);

        if (response.status === 429 || errorCode === '1302') {
          return {
            ok: false,
            content: null,
            error: 'Rate limited - please wait a moment and try again',
            usedFallback: false,
            isRateLimited: true,
            responseTime: Date.now() - startTime,
          };
        }

        lastError = `API error ${response.status}: ${errBody.slice(0, 200)}`;
        console.error(`API error attempt ${attempt + 1}:`, lastError);

        if (attempt < MAX_RETRIES) {
          continue;
        }

        return {
          ok: false,
          content: null,
          error: lastError,
          usedFallback: false,
          isRateLimited: false,
          responseTime: Date.now() - startTime,
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return {
          ok: false,
          content: null,
          error: 'Empty response from AI',
          usedFallback: false,
          isRateLimited: false,
          responseTime: Date.now() - startTime,
        };
      }

      return {
        ok: true,
        content,
        error: null,
        usedFallback: false,
        isRateLimited: false,
        retryCount: attempt,
        responseTime: Date.now() - startTime,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = err instanceof Error ? err.message : 'Unknown error';

      // Handle network errors and socket closure
      const isNetworkError =
        msg.includes('socket') ||
        msg.includes('connection') ||
        msg.includes('ECONNRESET') ||
        msg.includes('ENOTFOUND') ||
        msg.includes('ETIMEDOUT') ||
        msg.includes('fetch');

      lastError = msg;

      // Don't retry on abort (timeout)
      if (msg.includes('abort') || msg.includes('timeout')) {
        return {
          ok: false,
          content: null,
          error: 'Request timed out',
          usedFallback: false,
          isRateLimited: false,
          responseTime: Date.now() - startTime,
        };
      }

      // Retry on network errors including socket closure
      if (isNetworkError && attempt < MAX_RETRIES) {
        console.error(`AI request attempt ${attempt + 1} failed: ${msg}, retrying...`);
        continue;
      }

      return {
        ok: false,
        content: null,
        error: `Request failed: ${msg}`,
        usedFallback: false,
        isRateLimited: false,
        responseTime: Date.now() - startTime,
      };
    }
  }

  // Should not reach here, but satisfy TypeScript
  return {
    ok: false,
    content: null,
    error: lastError || 'Max retries exhausted',
    usedFallback: false,
    isRateLimited: false,
    responseTime: Date.now() - startTime,
  };
}

function extractErrorCode(body: string): string | null {
  try {
    const parsed = JSON.parse(body);
    return parsed?.error?.code ?? null;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safely parse JSON from AI response, handling malformed JSON.
 */
export function parseAIJson<T>(content: string): T | null {
  try {
    return JSON.parse(content) as T;
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
