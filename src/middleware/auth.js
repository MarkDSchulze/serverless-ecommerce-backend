/**
 * Authentication middleware
 * In production, this would verify JWT tokens from AWS Cognito
 */

/**
 * Verify JWT token (placeholder)
 */
function verifyToken(token) {
  // In production, verify JWT with AWS Cognito
  // For now, just check if token exists
  if (!token || token === '') {
    return { valid: false, error: 'No token provided' };
  }

  // Placeholder validation
  if (!token.startsWith('Bearer ')) {
    return { valid: false, error: 'Invalid token format' };
  }

  return {
    valid: true,
    userId: 'demo-user', // In production, extract from JWT
    email: 'demo@example.com'
  };
}

/**
 * Auth middleware wrapper
 */
function requireAuth(handler) {
  return async (event, context) => {
    const token = event.headers?.Authorization || event.headers?.authorization;
    
    const authResult = verifyToken(token);
    
    if (!authResult.valid) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized', message: authResult.error }),
      };
    }

    // Add user info to event
    event.user = {
      userId: authResult.userId,
      email: authResult.email
    };

    // Call the actual handler
    return handler(event, context);
  };
}

module.exports = {
  verifyToken,
  requireAuth,
};
