import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Protection Middleware using Double Submit Cookie Pattern
 *
 * This implements a secure CSRF protection without server-side state.
 * The client receives a CSRF token in a cookie and must send it back
 * in a custom header for state-changing operations.
 */

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Safe methods that don't require CSRF protection
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware to generate and set CSRF token cookie
 * This should be called early in the middleware chain
 */
export function csrfCookieSetter(req: Request, res: Response, next: NextFunction): void {
  // Only set cookie if it doesn't exist or is invalid
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }
  next();
}

/**
 * Middleware to verify CSRF token on state-changing requests
 * This should be applied to routes that modify data
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF check for safe methods
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  // Skip CSRF check for these specific endpoints
  // (they have their own authentication mechanisms)
  const skipPaths = [
    '/api/setup/',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
  ];

  if (skipPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;

  // Check if both tokens exist
  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token missing',
      message: 'CSRF protection requires a valid token',
    });
  }

  // Verify tokens match (timing-safe comparison)
  if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token mismatch',
      message: 'Invalid CSRF token',
    });
  }

  next();
}

/**
 * Endpoint to get CSRF token
 * The client can call this to get a fresh token if needed
 */
export function getCsrfToken(req: Request, res: Response): void {
  const token = req.cookies[CSRF_COOKIE_NAME];

  if (!token) {
    const newToken = generateToken();
    res.cookie(CSRF_COOKIE_NAME, newToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      data: { csrfToken: newToken },
    });
  }

  res.json({
    success: true,
    data: { csrfToken: token },
  });
}