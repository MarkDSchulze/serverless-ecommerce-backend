const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/response');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const CART_TABLE = process.env.CART_TABLE;

/**
 * Get user's shopping cart
 */
exports.getCart = async (event) => {
  try {
    // In production, get userId from JWT token
    const userId = event.queryStringParameters?.userId || 'demo-user';
    
    const result = await dynamodb.query({
      TableName: CART_TABLE,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`
      }
    }).promise();

    return successResponse(200, {
      userId,
      items: result.Items,
      itemCount: result.Items.length
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return errorResponse(500, 'Failed to fetch cart');
  }
};

/**
 * Add item to cart
 */
exports.addToCart = async (event) => {
  try {
    const { userId, productId, quantity, price, name } = JSON.parse(event.body);
    const itemId = uuidv4();
    const timestamp = new Date().toISOString();

    const item = {
      PK: `USER#${userId}`,
      SK: `ITEM#${itemId}`,
      itemId,
      productId,
      name,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      addedAt: timestamp,
      ttl: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days expiry
    };

    await dynamodb.put({
      TableName: CART_TABLE,
      Item: item
    }).promise();

    console.log('Item added to cart:', itemId);
    return successResponse(201, {
      message: 'Item added to cart',
      item
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return errorResponse(500, 'Failed to add item to cart');
  }
};

/**
 * Update cart item quantity
 */
exports.updateCartItem = async (event) => {
  try {
    const { itemId } = event.pathParameters;
    const { userId, quantity } = JSON.parse(event.body);

    const result = await dynamodb.update({
      TableName: CART_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `ITEM#${itemId}`
      },
      UpdateExpression: 'SET quantity = :quantity, updatedAt = :timestamp',
      ExpressionAttributeValues: {
        ':quantity': parseInt(quantity),
        ':timestamp': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    }).promise();

    return successResponse(200, {
      message: 'Cart item updated',
      item: result.Attributes
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return errorResponse(500, 'Failed to update cart item');
  }
};

/**
 * Remove item from cart
 */
exports.removeFromCart = async (event) => {
  try {
    const { itemId } = event.pathParameters;
    const userId = event.queryStringParameters?.userId || 'demo-user';

    await dynamodb.delete({
      TableName: CART_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `ITEM#${itemId}`
      }
    }).promise();

    console.log('Item removed from cart:', itemId);
    return successResponse(200, {
      message: 'Item removed from cart',
      itemId
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return errorResponse(500, 'Failed to remove item from cart');
  }
};
