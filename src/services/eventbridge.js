const AWS = require('aws-sdk');
const logger = require('../utils/logger');

const eventbridge = new AWS.EventBridge();

/**
 * Publish event to EventBridge
 */
async function publishEvent(eventBusName, source, detailType, detail) {
  const params = {
    Entries: [
      {
        Source: source,
        DetailType: detailType,
        Detail: JSON.stringify(detail),
        EventBusName: eventBusName,
      },
    ],
  };

  try {
    const result = await eventbridge.putEvents(params).promise();
    
    if (result.FailedEntryCount > 0) {
      logger.error('Event publication failed', {
        failures: result.Entries.filter(e => e.ErrorCode),
      });
      throw new Error('Failed to publish event');
    }

    logger.info('Event published', { source, detailType });
    return result;
  } catch (error) {
    logger.error('EventBridge publish error', {
      source,
      detailType,
      error: error.message,
    });
    throw error;
  }
}

module.exports = {
  publishEvent,
};
