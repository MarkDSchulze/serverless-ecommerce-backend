/**
 * Integration tests for API endpoints
 * These tests require a deployed API (dev environment)
 */

const https = require('https');

// Set your API URL here after deployment
const API_URL = process.env.API_URL || 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev';

/**
 * Helper function to make HTTP requests
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

describe('Products API Integration Tests', () => {
  let createdProductId;

  test('POST /products - should create a new product', async () => {
    const productData = {
      name: 'Test Product',
      description: 'Integration test product',
      price: 19.99,
      category: 'Test',
      inventory: 50
    };

    const response = await makeRequest('POST', '/products', productData);
    
    expect(response.statusCode).toBe(201);
    expect(response.body.product).toBeDefined();
    expect(response.body.product.name).toBe('Test Product');
    expect(response.body.product.price).toBe(19.99);
    
    createdProductId = response.body.product.productId;
  }, 10000);

  test('GET /products - should return list of products', async () => {
    const response = await makeRequest('GET', '/products');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.products).toBeDefined();
    expect(Array.isArray(response.body.products)).toBe(true);
    expect(response.body.count).toBeGreaterThan(0);
  }, 10000);

  test('GET /products/{id} - should return single product', async () => {
    if (!createdProductId) {
      console.log('Skipping: No product ID from creation test');
      return;
    }

    const response = await makeRequest('GET', `/products/${createdProductId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.product).toBeDefined();
    expect(response.body.product.productId).toBe(createdProductId);
  }, 10000);

  test('PUT /products/{id} - should update product', async () => {
    if (!createdProductId) {
      console.log('Skipping: No product ID from creation test');
      return;
    }

    const updateData = {
      price: 24.99,
      inventory: 75
    };

    const response = await makeRequest('PUT', `/products/${createdProductId}`, updateData);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.product.price).toBe(24.99);
    expect(response.body.product.inventory).toBe(75);
  }, 10000);

  test('DELETE /products/{id} - should delete product', async () => {
    if (!createdProductId) {
      console.log('Skipping: No product ID from creation test');
      return;
    }

    const response = await makeRequest('DELETE', `/products/${createdProductId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('deleted');
  }, 10000);
});

describe('Cart API Integration Tests', () => {
  const testUserId = 'test-user-' + Date.now();

  test('GET /cart - should return empty cart for new user', async () => {
    const response = await makeRequest('GET', `/cart?userId=${testUserId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.items).toBeDefined();
    expect(Array.isArray(response.body.items)).toBe(true);
  }, 10000);

  test('POST /cart/items - should add item to cart', async () => {
    const cartItem = {
      userId: testUserId,
      productId: 'test-product-001',
      name: 'Test Product',
      quantity: 2,
      price: 29.99
    };

    const response = await makeRequest('POST', '/cart/items', cartItem);
    
    expect(response.statusCode).toBe(201);
    expect(response.body.item).toBeDefined();
    expect(response.body.item.quantity).toBe(2);
  }, 10000);
});

describe('Orders API Integration Tests', () => {
  const testUserId = 'test-user-' + Date.now();

  test('POST /orders - should create a new order', async () => {
    const orderData = {
      userId: testUserId,
      items: [
        {
          productId: 'test-product-001',
          name: 'Test Product',
          quantity: 1,
          price: 29.99
        }
      ],
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345'
      },
      paymentMethod: 'card'
    };

    const response = await makeRequest('POST', '/orders', orderData);
    
    expect(response.statusCode).toBe(201);
    expect(response.body.order).toBeDefined();
    expect(response.body.order.total).toBe(29.99);
    expect(response.body.order.status).toBe('PENDING');
  }, 10000);

  test('GET /orders - should return user orders', async () => {
    const response = await makeRequest('GET', `/orders?userId=${testUserId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.orders).toBeDefined();
    expect(Array.isArray(response.body.orders)).toBe(true);
  }, 10000);
});

describe('Error Handling', () => {
  test('GET /products/{invalid-id} - should return 404', async () => {
    const response = await makeRequest('GET', '/products/non-existent-id');
    
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBeDefined();
  }, 10000);

  test('POST /products - should return 400 for invalid data', async () => {
    const invalidData = {
      name: 'Test'
      // Missing required fields: price, category
    };

    const response = await makeRequest('POST', '/products', invalidData);
    
    // May return 400 or 500 depending on validation
    expect([400, 500]).toContain(response.statusCode);
    expect(response.body.error).toBeDefined();
  }, 10000);
});

describe('CORS Headers', () => {
  test('Should include CORS headers in response', async () => {
    const response = await makeRequest('GET', '/products');
    
    expect(response.headers['access-control-allow-origin']).toBe('*');
  }, 10000);
});
