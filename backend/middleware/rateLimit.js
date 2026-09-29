// Limiteur de débit minimal, en mémoire, sans dépendance externe (§10.1 et §12 du cahier :
// limiter les tentatives de connexion et les soumissions de formulaires publics).
// Une fenêtre glissante simple par adresse IP : suffisant pour un unique serveur de portfolio.

const buckets = new Map(); // "route:ip" -> { count, resetAt }

function rateLimit({ windowMs, max, message }) {
  return (req, res, next) => {
    const key = `${req.baseUrl}${req.path}:${req.ip}`;
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      return res.status(429).json({
        error: { code: "TOO_MANY_REQUESTS", message: message || "Trop de tentatives, réessayez plus tard." },
      });
    }

    next();
  };
}

module.exports = { rateLimit };
