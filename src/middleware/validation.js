/**
 * Input validation middleware
 */

/**
 * Validate product data
 */
function validateProduct(product) {
  const errors = [];

  if (!product.name || product.name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (!product.price || isNaN(product.price) || product.price <= 0) {
    errors.push('Valid product price is required');
  }

  if (!product.category || product.category.trim().length === 0) {
    errors.push('Product category is required');
  }

  if (product.inventory !== undefined && (isNaN(product.inventory) || product.inventory < 0)) {
    errors.push('Inventory must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate order data
 */
function validateOrder(order) {
  const errors = [];

  if (!order.userId) {
    errors.push('User ID is required');
  }

  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (!order.shippingAddress || !order.shippingAddress.street) {
    errors.push('Shipping address is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate cart item
 */
function validateCartItem(item) {
  const errors = [];

  if (!item.productId) {
    errors.push('Product ID is required');
  }

  if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
    errors.push('Valid quantity is required');
  }

  if (!item.price || isNaN(item.price) || item.price <= 0) {
    errors.push('Valid price is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateProduct,
  validateOrder,
  validateCartItem,
};
