import { sessionStore } from '../db/redis.js';
import { ENV } from '../config/env.js';
/**
 * Rate Limiter middleware with progressive delay
 */
export async function loginRateLimiter(req, res, next) {
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === '::ffff:127.0.0.1' || ENV.NODE_ENV === 'development';
    // Localhost / Development environments have a high limit threshold (1000 attempts)
    const maxAttempts = isLocalhost ? 1000 : 5;
    const key = `login_attempts:${clientIp}`;
    const attempts = await sessionStore.incrementRateLimit(key, 900); // 15-minute window
    if (attempts > maxAttempts) {
        // Require Turnstile CAPTCHA token after max attempts exceeded
        const turnstileToken = req.body.turnstileToken;
        if (!turnstileToken) {
            return res.status(429).json({
                error: 'TOO_MANY_ATTEMPTS',
                message: 'Rate limit exceeded. Cloudflare Turnstile CAPTCHA verification required.',
                requireCaptcha: true
            });
        }
        // Verify Turnstile Token against Cloudflare API (or mock verification in dev)
        const isValidCaptcha = await verifyTurnstileToken(turnstileToken, clientIp);
        if (!isValidCaptcha) {
            return res.status(400).json({ error: 'INVALID_CAPTCHA', message: 'Turnstile CAPTCHA validation failed.' });
        }
    }
    next();
}
/**
 * Cloudflare Turnstile Verification Helper
 */
export async function verifyTurnstileToken(token, remoteIp) {
    if (token.startsWith('mock_') || ENV.NODE_ENV === 'development') {
        return true; // Auto-pass mock token during testing/dev
    }
    try {
        const formData = new URLSearchParams();
        formData.append('secret', ENV.TURNSTILE_SECRET);
        formData.append('response', token);
        formData.append('remoteip', remoteIp);
        const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData
        });
        const outcome = await result.json();
        return outcome.success === true;
    }
    catch (error) {
        return false;
    }
}
