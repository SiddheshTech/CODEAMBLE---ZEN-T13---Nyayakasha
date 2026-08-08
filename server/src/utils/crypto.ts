import crypto from 'crypto';
import argon2 from 'argon2';
import zxcvbn from 'zxcvbn';

/**
 * Hash password with Argon2id (with fallback to PBKDF2 if argon2 native module fails)
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4
    });
  } catch (err) {
    // Fallback to PBKDF2 if native Argon2 binding fails in environment
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `pbkdf2$${salt}$${derivedKey}`;
  }
}

/**
 * Verify password against stored hash with Argon2id / PBKDF2 fallback
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (hash.startsWith('pbkdf2$')) {
      const parts = hash.split('$');
      const salt = parts[1];
      const storedKey = parts[2];
      const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
      return safeCompareString(derivedKey, storedKey);
    }
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function safeCompareString(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');

  if (bufA.length !== bufB.length) {
    // Still perform timing comparison against dummy buffer to preserve latency
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * SHA-256 Helper
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * HIBP K-Anonymity Check
 * Sends ONLY the first 5 chars of the SHA-1 hash of the password to Have I Been Pwned.
 */
export async function checkHIBP(password: string): Promise<{ isPwned: boolean; count: number }> {
  try {
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'User-Agent': 'NYAYAKASHA-Auth-Security' }
    });

    if (!response.ok) {
      // Graceful fallback if API fails
      return { isPwned: false, count: 0 };
    }

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [lineSuffix, countStr] = line.trim().split(':');
      if (lineSuffix === suffix) {
        return { isPwned: true, count: parseInt(countStr, 10) || 1 };
      }
    }
    return { isPwned: false, count: 0 };
  } catch (error) {
    return { isPwned: false, count: 0 };
  }
}

/**
 * zxcvbn Password Strength Evaluator
 */
export function evaluatePasswordStrength(password: string, userInputs: string[] = []) {
  const result = zxcvbn(password, userInputs);
  return {
    score: result.score, // 0 - 4
    warning: result.feedback.warning,
    suggestions: result.feedback.suggestions,
    crackTimesDisplay: result.crack_times_display
  };
}
