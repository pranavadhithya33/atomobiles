// lib/adminAuth.js
// Shared admin authentication helper for API routes.
// Verifies the x-admin-token header against a hashed version of ADMIN_PASSWORD.

import { createHash } from 'crypto';

/**
 * Hash a password with SHA-256 (deterministic, no salt needed for simple token matching).
 */
function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Generate an admin token from the admin password.
 * This is sent to the client on successful login and must be included
 * in all subsequent admin API requests.
 */
export function generateAdminToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('ADMIN_PASSWORD not configured');
  return hashPassword(password + '__og_admin_salt__');
}

/**
 * Verify that the incoming request has a valid admin token.
 * Returns { authorized: true } or { authorized: false, response: NextResponse }.
 */
export function verifyAdminRequest(req) {
  const { NextResponse } = require('next/server');
  
  const token = req.headers.get('x-admin-token');
  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    };
  }

  try {
    const expectedToken = generateAdminToken();
    if (token !== expectedToken) {
      return {
        authorized: false,
        response: NextResponse.json({ error: 'Invalid admin token' }, { status: 403 })
      };
    }
    return { authorized: true };
  } catch (err) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    };
  }
}
