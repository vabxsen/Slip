/** Simple sliding-window rate limiter keyed by an arbitrary string (typically a socket id). */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly maxHits: number,
    private readonly windowMs: number,
  ) {}

  /** Returns true if this call is allowed under the limit, false if it should be dropped. */
  allow(key: string): boolean {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.maxHits) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }

  /** Drops state for a key — call on socket disconnect so the map doesn't grow forever. */
  clear(key: string): void {
    this.hits.delete(key);
  }
}
