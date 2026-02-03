/**
 * Simple in-memory rate limiter (per-identifier, fixed window).
 * Suitable for throttling API routes; state is per-instance (resets on cold start).
 */

type WindowState = { count: number; windowStartMs: number };

const store = new Map<string, WindowState>();

const defaultWindowMs = 60 * 1000; // 1 minute
const defaultMaxRequests = 10;

/**
 * Checks whether the request is within the rate limit for the given identifier.
 * If allowed, consumes one request from the window.
 *
 * @param identifier - e.g. userId or IP
 * @param options - windowMs: window length in ms; maxRequests: max requests per window
 * @returns true if allowed, false if limit exceeded
 */
export function checkRateLimit(
  identifier: string,
  options: { windowMs?: number; maxRequests?: number } = {},
): boolean {
  const windowMs = options.windowMs ?? defaultWindowMs;
  const maxRequests = options.maxRequests ?? defaultMaxRequests;
  const now = Date.now();

  let state = store.get(identifier);

  if (!state) {
    store.set(identifier, { count: 1, windowStartMs: now });
    return true;
  }

  if (now - state.windowStartMs >= windowMs) {
    state = { count: 1, windowStartMs: now };
    store.set(identifier, state);
    return true;
  }

  state.count += 1;
  if (state.count > maxRequests) {
    return false;
  }
  return true;
}

/**
 * Removes expired entries from the store to avoid unbounded growth.
 * Call periodically if desired; not required for correctness.
 */
export function pruneExpiredRateLimitEntries(
  windowMs: number = defaultWindowMs,
): void {
  const now = Date.now();
  for (const [key, state] of store.entries()) {
    if (now - state.windowStartMs >= windowMs) {
      store.delete(key);
    }
  }
}
