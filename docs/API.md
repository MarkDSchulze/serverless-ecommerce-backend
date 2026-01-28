# API Documentation

Complete API reference for the Serverless E-commerce Backend.

## Base URL
```
https://your-api-id.execute-api.us-east-1.amazonaws.com/dev
```

Replace `your-api-id` with your actual API Gateway ID from deployment output.

## Authentication

Currently uses demo authentication. In production, all authenticated endpoints require a Bearer token:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Products API

### Create Product

**POST** `/products`

Create a new product in the catalog.

**Request Body:**
```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "price": 29.99,
  "category": "Electronics",
  "inventory": 100
}
```

**Response:** `201 Created`
```json
{
  "message": "Product created successfully",
  "product": {
    "productId": "a3f2c1e8-...",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "price": 29.99,
    "category": "Electronics",
    "inventory": 100,
    "createdAt": "2026-01-27T10:30:00.000Z",
    "updatedAt": "2026-01-27T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST https://your-api-url/dev/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "price": 29.99,
    "category": "Electronics",
    "inventory": 100
  }'
```

---

### List Products

**GET** `/products`

Get all products or filter by category.

**Query Parameters:**
- `category` (optional) - Filter by category name
- `limit` (optional) - Max items to return (default: 50)

**Examples:**
```
GET /products
GET /products?category=Electronics
GET /products?category=Electronics&limit=20
```

**Response:** `200 OK`
```json
{
  "products": [
    {
      "productId": "001",
      "name": "Wireless Mouse",
      "price": 29.99,
      "category": "Electronics",
      "inventory": 150
    }
  ],
  "count": 1
}
```

**cURL Example:**
```bash
curl https://your-api-url/dev/products?category=Electronics
```

---

### Get Single Product

**GET** `/products/{productId}`

Get details of a specific product.

**Path Parameters:**
- `productId` - The product identifier

**Response:** `200 OK`
```json
{
  "product": {
    "productId": "001",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with 3 buttons",
    "price": 29.99,
    "category": "Electronics",
    "inventory": 150,
    "images": [
      {
        "id": "img-001",
        "url": "https://d123.cloudfront.net/products/001/img-001.jpg"
      }
    ],
    "createdAt": "2026-01-27T10:30:00.000Z",
    "updatedAt": "2026-01-27T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl https://your-api-url/dev/products/001
```

---

### Update Product

**PUT** `/products/{productId}`

Update product details. Only provided fields will be updated.

**Path Parameters:**
- `productId` - The product identifier

**Request Body:**
```json
{
  "price": 24.99,
  "inventory": 150
}
```

**Response:** `200 OK`
```json
{
  "message": "Product updated successfully",
  "product": {
    "productId": "001",
    "name": "Wireless Mouse",
    "price": 24.99,
    "inventory": 150,
    "updatedAt": "2026-01-27T11:00:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X PUT https://your-api-url/dev/products/001 \
  -H "Content-Type: application/json" \
  -d '{"price": 24.99, "inventory": 150}'
```

---

### Delete Product

**DELETE** `/products/{productId}`

Remove a product from the catalog.

**Path Parameters:**
- `productId` - The product identifier

**Response:** `200 OK`
```json
{
  "message": "Product deleted successfully",
  "productId": "001"
}
```

**cURL Example:**
```bash
curl -X DELETE https://your-api-url/dev/products/001
```

---

## Shopping Cart API

### Get Cart

**GET** `/cart?userId={userId}`

Get user's shopping cart with all items.

**Query Parameters:**
- `userId` - The user identifier

**Response:** `200 OK`
```json
{
  "userId": "user-123",
  "items": [
    {
      "itemId": "cart-item-001",
      "productId": "001",
      "name": "Wireless Mouse",
      "quantity": 2,
      "price": 29.99,
      "addedAt": "2026-01-27T10:30:00.000Z"
    }
  ],
  "itemCount": 1
}
```

**cURL Example:**
```bash
curl https://your-api-url/dev/cart?userId=user-123
```

---

### Add to Cart

**POST** `/cart/items`

Add an item to the shopping cart.

**Request Body:**
```json
{
  "userId": "user-123",
  "productId": "001",
  "name": "Wireless Mouse",
  "quantity": 2,
  "price": 29.99
}
```

**Response:** `201 Created`
```json
{
  "message": "Item added to cart",
  "item": {
    "itemId": "cart-item-001",
    "productId": "001",
    "name": "Wireless Mouse",
    "quantity": 2,
    "price": 29.99,
    "addedAt": "2026-01-27T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST https://your-api-url/dev/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "productId": "001",
    "name": "Wireless Mouse",
    "quantity": 2,
    "price": 29.99
  }'
```

---

### Update Cart Item

**PUT** `/cart/items/{itemId}`

Update the quantity of an item in the cart.

**Path Parameters:**
- `itemId` - The cart item identifier

**Request Body:**
```json
{
  "userId": "user-123",
  "quantity": 3
}
```

**Response:** `200 OK`
```json
{
  "message": "Cart item updated",
  "item": {
    "itemId": "cart-item-001",
    "productId": "001",
    "quantity": 3,
    "updatedAt": "2026-01-27T10:35:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X PUT https://your-api-url/dev/cart/items/cart-item-001 \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123", "quantity": 3}'
```

---

### Remove from Cart

**DELETE** `/cart/items/{itemId}?userId={userId}`

Remove an item from the cart.

**Path Parameters:**
- `itemId` - The cart item identifier

**Query Parameters:**
- `userId` - The user identifier

**Response:** `200 OK`
```json
{
  "message": "Item removed from cart",
  "itemId": "cart-item-001"
}
```

**cURL Example:**
```bash
curl -X DELETE https://your-api-url/dev/cart/items/cart-item-001?userId=user-123
```

---

## Orders API

### Create Order

**POST** `/orders`

Create a new order from cart items.

**Request Body:**
```json
{
  "userId": "user-123",
  "items": [
    {
      "productId": "001",
      "name": "Wireless Mouse",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "paymentMethod": "card"
}
```

**Response:** `201 Created`
```json
{
  "message": "Order created successfully",
  "order": {
    "orderId": "order-001",
    "userId": "user-123",
    "items": [...],
    "total": 59.98,
    "shippingAddress": {...},
    "status": "PENDING",
    "createdAt": "2026-01-27T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST https://your-api-url/dev/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "items": [
      {
        "productId": "001",
        "name": "Wireless Mouse",
        "quantity": 2,
        "price": 29.99
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    },
    "paymentMethod": "card"
  }'
```

---

### List Orders

**GET** `/orders?userId={userId}`

Get user's order history.

**Query Parameters:**
- `userId` - The user identifier

**Response:** `200 OK`
```json
{
  "userId": "user-123",
  "orders": [
    {
      "orderId": "order-001",
      "total": 59.98,
      "status": "CONFIRMED",
      "createdAt": "2026-01-27T10:30:00.000Z",
      "updatedAt": "2026-01-27T10:31:00.000Z"
    }
  ],
  "count": 1
}
```

**cURL Example:**
```bash
curl https://your-api-url/dev/orders?userId=user-123
```

---

### Get Order Details

**GET** `/orders/{orderId}?userId={userId}`

Get details of a specific order.

**Path Parameters:**
- `orderId` - The order identifier

**Query Parameters:**
- `userId` - The user identifier

**Response:** `200 OK`
```json
{
  "order": {
    "orderId": "order-001",
    "userId": "user-123",
    "items": [
      {
        "productId": "001",
        "name": "Wireless Mouse",
        "quantity": 2,
        "price": 29.99
      }
    ],
    "total": 59.98,
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    },
    "status": "CONFIRMED",
    "createdAt": "2026-01-27T10:30:00.000Z",
    "updatedAt": "2026-01-27T10:31:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl https://your-api-url/dev/orders/order-001?userId=user-123
```

---

## Images API

### Upload Product Image

**POST** `/products/{productId}/images`

Upload an image for a product.

**Path Parameters:**
- `productId` - The product identifier

**Request Body:**
- Binary image data (JPEG)
- Base64 encoded image

**Response:** `200 OK`
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "https://d123.cloudfront.net/products/001/img-abc.jpg"
}
```

---

### Get Presigned Upload URL

**GET** `/products/{productId}/upload-url`

Get a presigned URL for direct upload to S3.

**Path Parameters:**
- `productId` - The product identifier

**Response:** `200 OK`
```json
{
  "uploadUrl": "https://bucket.s3.amazonaws.com/...",
  "imageId": "img-abc",
  "key": "products/001/img-abc.jpg"
}
```

---

## Error Responses

All errors follow this standardized format:
```json
{
  "error": "Error message description",
  "timestamp": "2026-01-27T10:30:00.000Z"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Missing or invalid auth token |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

### Example Error Responses

**400 Bad Request:**
```json
{
  "error": "Missing required fields: name, price, category",
  "timestamp": "2026-01-27T10:30:00.000Z"
}
```

**404 Not Found:**
```json
{
  "error": "Product not found",
  "timestamp": "2026-01-27T10:30:00.000Z"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "timestamp": "2026-01-27T10:30:00.000Z"
}
```

---

## Rate Limiting

- Default: 1000 requests per second per API key
- Burst: 2000 requests
- Throttling: 429 status code when exceeded

## CORS

All endpoints support CORS with:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## Pagination

For endpoints returning lists, use:
- `limit` - Max items per page (default: 50, max: 100)
- `lastKey` - Token for next page (returned in response)

Example:
```
GET /products?limit=20&lastKey=eyJQSyI6IlBST0RVQ1QjMDAxIn0=
```

---

## Testing

Use the provided seed script to populate test data:
```bash
PRODUCTS_TABLE=your-table-name node scripts/seed-data.js
```

This creates 8 sample products in Electronics and Accessories categories.
