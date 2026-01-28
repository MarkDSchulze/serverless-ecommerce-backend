const AWS = require('aws-sdk');
const logger = require('../utils/logger');

const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * Get item from DynamoDB
 */
async function getItem(tableName, key) {
  const params = {
    TableName: tableName,
    Key: key,
  };

  try {
    const result = await dynamodb.get(params).promise();
    logger.debug('DynamoDB getItem success', { tableName, key });
    return result.Item;
  } catch (error) {
    logger.error('DynamoDB getItem failed', { tableName, key, error: error.message });
    throw error;
  }
}

/**
 * Put item to DynamoDB
 */
async function putItem(tableName, item) {
  const params = {
    TableName: tableName,
    Item: item,
  };

  try {
    await dynamodb.put(params).promise();
    logger.debug('DynamoDB putItem success', { tableName });
    return item;
  } catch (error) {
    logger.error('DynamoDB putItem failed', { tableName, error: error.message });
    throw error;
  }
}

/**
 * Update item in DynamoDB
 */
async function updateItem(tableName, key, updateExpression, expressionAttributeValues, expressionAttributeNames = {}) {
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };

  if (Object.keys(expressionAttributeNames).length > 0) {
    params.ExpressionAttributeNames = expressionAttributeNames;
  }

  try {
    const result = await dynamodb.update(params).promise();
    logger.debug('DynamoDB updateItem success', { tableName, key });
    return result.Attributes;
  } catch (error) {
    logger.error('DynamoDB updateItem failed', { tableName, key, error: error.message });
    throw error;
  }
}

/**
 * Delete item from DynamoDB
 */
async function deleteItem(tableName, key) {
  const params = {
    TableName: tableName,
    Key: key,
  };

  try {
    await dynamodb.delete(params).promise();
    logger.debug('DynamoDB deleteItem success', { tableName, key });
  } catch (error) {
    logger.error('DynamoDB deleteItem failed', { tableName, key, error: error.message });
    throw error;
  }
}

/**
 * Query DynamoDB
 */
async function query(tableName, keyConditionExpression, expressionAttributeValues, indexName = null, limit = null) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  if (indexName) {
    params.IndexName = indexName;
  }

  if (limit) {
    params.Limit = limit;
  }

  try {
    const result = await dynamodb.query(params).promise();
    logger.debug('DynamoDB query success', { tableName, count: result.Items.length });
    return result.Items;
  } catch (error) {
    logger.error('DynamoDB query failed', { tableName, error: error.message });
    throw error;
  }
}

/**
 * Scan DynamoDB table
 */
async function scan(tableName, filterExpression = null, expressionAttributeValues = null, limit = null) {
  const params = {
    TableName: tableName,
  };

  if (filterExpression) {
    params.FilterExpression = filterExpression;
    params.ExpressionAttributeValues = expressionAttributeValues;
  }

  if (limit) {
    params.Limit = limit;
  }

  try {
    const result = await dynamodb.scan(params).promise();
    logger.debug('DynamoDB scan success', { tableName, count: result.Items.length });
    return result.Items;
  } catch (error) {
    logger.error('DynamoDB scan failed', { tableName, error: error.message });
    throw error;
  }
}

module.exports = {
  getItem,
  putItem,
  updateItem,
  deleteItem,
  query,
  scan,
};
