/**
 * Seed sample data into DynamoDB
 * Usage: node scripts/seed-data.js
 */

const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'serverless-ecommerce-backend-products-dev';

const sampleProducts = [
  {
    PK: 'PRODUCT#001',
    SK: 'METADATA',
    productId: '001',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with 3 buttons',
    price: 29.99,
    category: 'Electronics',
    inventory: 150,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    GSI1PK: 'CATEGORY#Electronics',
    GSI1SK: 'PRODUCT#001'
  },
  {
    PK: 'PRODUCT#002',
    SK: 'METADATA',
    productId: '002',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches',
    price: 89.99,
    category: 'Electronics',
    inventory: 75,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    GSI1PK: 'CATEGORY#Electronics',
    GSI1SK: 'PRODUCT#002'
  },
  {
    PK: 'PRODUCT#003',
    SK: 'METADATA',
    productId: '003',
    name: 'USB-C Cable',
    description: '6ft braided USB-C charging cable',
    price: 12.99,
    category: 'Accessories',
    inventory: 300,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    GSI1PK: 'CATEGORY#Accessories',
    GSI1SK: 'PRODUCT#003'
  },
  {
    PK: 'PRODUCT#004',
    SK: 'METADATA',
    productId: '004',
    name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand',
    price: 39.99,
    category: 'Accessories',
    inventory: 120,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    GSI1PK: 'CATEGORY#Accessories',
    GSI1SK: 'PRODUCT#004'
  },
  {
    PK: 'PRODUCT#005',
    SK: 'METADATA',
    productId: '005',
    name: 'Webcam HD',
    description: '1080p webcam with built-in microphone',
    price: 59.99,
    category: 'Electronics',
    inventory: 90,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    GSI1PK: 'CATEGORY#Electronics',
    GSI1SK: 'PRODUCT#005'
  },
  {
    PK: 'PRODUCT#006',
    SK: 'METADATA',
    productId: '006',
    name: 'Phone Case',
    description: 'Protective silicone phone case',
    price: 14.99,
    category: 'Accessories',
    inventory: 200,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    GSI1PK: 'CATEGORY#Accessories',
    GSI1SK: 'PRODUCT#006'
  },
  {
    PK: 'PRODUCT#007',
    SK: 'METADATA',
    productId: '007',
    name: 'Headphones',
    description: 'Noise-cancelling over-ear headphones',
    price: 149.99,
    category: 'Electronics',
    inventory: 60,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    GSI1PK: 'CATEGORY#Electronics',
    GSI1SK: 'PRODUCT#007'
  },
  {
    PK: 'PRODUCT#008',
    SK: 'METADATA',
    productId: '008',
    name: 'Monitor Stand',
    description: 'Dual monitor desk stand',
    price: 79.99,
    category: 'Accessories',
    inventory: 45,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    GSI1PK: 'CATEGORY#Accessories',
    GSI1SK: 'PRODUCT#008'
  }
];

async function seedData() {
  console.log(`Seeding ${sampleProducts.length} products into ${PRODUCTS_TABLE}...\n`);
  
  for (const product of sampleProducts) {
    try {
      await dynamodb.put({
        TableName: PRODUCTS_TABLE,
        Item: product
      }).promise();
      
      console.log(`✓ Added: ${product.name} - $${product.price}`);
    } catch (error) {
      console.error(`✗ Failed to add ${product.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Seeding complete!');
  console.log(`Total products: ${sampleProducts.length}`);
}

// Run the seed function
seedData().catch(error => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
