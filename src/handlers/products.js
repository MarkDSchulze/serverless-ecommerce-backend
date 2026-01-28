const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/response');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

/**
 * Create a new product
 */
exports.createProduct = async (event) => {
  try {
    const product = JSON.parse(event.body);
    const productId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const item = {
      PK: `PRODUCT#${productId}`,
      SK: 'METADATA',
      productId,
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price),
      category: product.category,
      inventory: product.inventory || 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await dynamodb.put({
      TableName: PRODUCTS_TABLE,
      Item: item,
    }).promise();

    console.log('Product created:', productId);
    return successResponse(201, { 
      message: 'Product created successfully',
      product: item 
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
    return errorResponse(500, 'Failed to create product');
  }
};

/**
 * Get all products
 */
exports.getProducts = async (event) => {
  try {
    const result = await dynamodb.scan({
      TableName: PRODUCTS_TABLE,
    }).promise();

    console.log(`Retrieved ${result.Items.length} products`);
    return successResponse(200, { 
      products: result.Items,
      count: result.Items.length
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return errorResponse(500, 'Failed to fetch products');
  }
};