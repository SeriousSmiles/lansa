interface RateLimitOptions {
  limit: number;
  window: number; // seconds
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  req: Request,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  // Get client identifier (IP or user ID from JWT)
  const clientId = req.headers.get('x-forwarded-for') || 
                   req.headers.get('cf-connecting-ip') || 
                   'unknown';
  const now = Date.now();
  
  const record = rateLimitStore.get(clientId);
  
  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(clientId, {
      count: 1,
      resetAt: now + (options.window * 1000)
    });
    return { allowed: true };
  }
  
  if (record.count >= options.limit) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  // Increment count
  record.count++;
  return { allowed: true };
}

// Cleanup old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute
