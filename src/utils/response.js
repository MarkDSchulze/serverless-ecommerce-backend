/**
 * Utility functions for standardized API responses
 */

function successResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(data),
  };
}

function errorResponse(statusCode, message) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ 
      error: message,
      timestamp: new Date().toISOString()
    }),
  };
}

module.exports = { successResponse, errorResponse };
