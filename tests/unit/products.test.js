const { validateProduct } = require('../../src/middleware/validation');

describe('Product Validation', () => {
  test('should validate correct product', () => {
    const product = {
      name: 'Test Product',
      price: 29.99,
      category: 'Electronics',
      inventory: 100
    };

    const result = validateProduct(product);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject product without name', () => {
    const product = {
      price: 29.99,
      category: 'Electronics'
    };

    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Product name is required');
  });

  test('should reject product with invalid price', () => {
    const product = {
      name: 'Test Product',
      price: -10,
      category: 'Electronics'
    };

    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Valid product price is required');
  });

  test('should reject product without category', () => {
    const product = {
      name: 'Test Product',
      price: 29.99
    };

    const result = validateProduct(product);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Product category is required');
  });
});
