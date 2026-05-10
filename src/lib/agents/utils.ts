export const MODEL_NAME = 'gemini-2.5-flash';
export const GEMINI_TIMEOUT_MS = 25_000;

export async function withTimeout<T>(
  promise: Promise<T>,
  label: string,
  timeoutMs = GEMINI_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
