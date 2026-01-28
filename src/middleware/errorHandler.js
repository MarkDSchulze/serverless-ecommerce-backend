const { errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
function errorHandler(handler) {
  return async (event, context) => {
    try {
      return await handler(event, context);
    } catch (error) {
      logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        event: JSON.stringify(event)
      });

      // Handle specific AWS errors
      if (error.code === 'ConditionalCheckFailedException') {
        return errorResponse(409, 'Resource conflict - item already exists or condition not met');
      }

      if (error.code === 'ResourceNotFoundException') {
        return errorResponse(404, 'Resource not found');
      }

      if (error.code === 'ValidationException') {
        return errorResponse(400, 'Invalid request data');
      }

      if (error.code === 'ProvisionedThroughputExceededException') {
        return errorResponse(429, 'Too many requests - please try again');
      }

      // Generic error
      return errorResponse(500, 'Internal server error');
    }
  };
}

module.exports = {
  errorHandler,
};
