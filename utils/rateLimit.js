// Simple in-memory rate limiter — no external dependencies

const store = new Map();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000).unref();

function rateLimit({ windowMs = 60_000, max = 5, message = 'Zu viele Anfragen. Bitte warte einen Moment.' } = {}) {
  return (req, res, next) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (forwarded ? forwarded.split(',')[0] : req.ip || 'unknown').trim();
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ error: message });
    }
    next();
  };
}

module.exports = { rateLimit };
