const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/response');
const { publishEvent } = require('../services/eventbridge');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const ORDERS_TABLE = process.env.ORDERS_TABLE;
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME;

/**
 * Create a new order
 */
exports.createOrder = async (event) => {
  try {
    const { userId, items, shippingAddress, paymentMethod } = JSON.parse(event.body);
    const orderId = uuidv4();
    const timestamp = new Date().toISOString();

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const order = {
      PK: `USER#${userId}`,
      SK: `ORDER#${orderId}`,
      orderId,
      userId,
      items,
      total,
      shippingAddress,
      paymentMethod,
      status: 'PENDING',
      createdAt: timestamp,
      updatedAt: timestamp,
      GSI1PK: `ORDER#${orderId}`,
      GSI1SK: timestamp
    };

    await dynamodb.put({
      TableName: ORDERS_TABLE,
      Item: order
    }).promise();

    // Publish order created event
    await publishEvent(
      EVENT_BUS_NAME,
      'ecommerce.orders',
      'OrderCreated',
      { orderId, userId, total, itemCount: items.length }
    );

    console.log('Order created:', orderId);
    return successResponse(201, {
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return errorResponse(500, 'Failed to create order');
  }
};

/**
 * Get user's orders
 */
exports.getOrders = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId || 'demo-user';

    const result = await dynamodb.query({
      TableName: ORDERS_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'ORDER#'
      }
    }).promise();

    return successResponse(200, {
      userId,
      orders: result.Items,
      count: result.Items.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return errorResponse(500, 'Failed to fetch orders');
  }
};

/**
 * Get single order details
 */
exports.getOrder = async (event) => {
  try {
    const { orderId } = event.pathParameters;
    const userId = event.queryStringParameters?.userId || 'demo-user';

    const result = await dynamodb.get({
      TableName: ORDERS_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `ORDER#${orderId}`
      }
    }).promise();

    if (!result.Item) {
      return errorResponse(404, 'Order not found');
    }

    return successResponse(200, { order: result.Item });
  } catch (error) {
    console.error('Error fetching order:', error);
    return errorResponse(500, 'Failed to fetch order');
  }
};

/**
 * Process order created event (triggered by EventBridge)
 */
exports.processOrderEvent = async (event) => {
  try {
    const { orderId, userId } = event.detail;
    
    console.log('Processing order:', orderId);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update order status
    await dynamodb.update({
      TableName: ORDERS_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `ORDER#${orderId}`
      },
      UpdateExpression: 'SET #status = :status, updatedAt = :timestamp',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'CONFIRMED',
        ':timestamp': new Date().toISOString()
      }
    }).promise();

    console.log('Order processed successfully:', orderId);
  } catch (error) {
    console.error('Error processing order event:', error);
    throw error;
  }
};
