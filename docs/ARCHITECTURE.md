# Architecture Documentation

Detailed architecture and design decisions for the Serverless E-commerce Backend.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [AWS Services](#aws-services)
3. [Data Models](#data-models)
4. [API Design](#api-design)
5. [Security](#security)
6. [Scalability](#scalability)
7. [Monitoring](#monitoring)
8. [Cost Analysis](#cost-analysis)

---

## System Architecture

### High-Level Overview
```
┌──────────────────────────────────────────────────────────────┐
│                         Client Layer                          │
│                    (Web/Mobile/Desktop)                       │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                      CloudFront (CDN)                         │
│                    Global Edge Locations                      │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                      API Gateway                              │
│           RESTful API │ Rate Limiting │ CORS                  │
└────────────────────────┬─────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Lambda     │  │   Lambda     │  │   Lambda     │
│  Products    │  │    Cart      │  │   Orders     │
└───────┬──────┘  └───────┬──────┘  └───────┬──────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  DynamoDB    │  │      S3      │  │ EventBridge  │
│   Tables     │  │    Images    │  │   Events     │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Request Flow

**1. Create Product:**
```
Client → CloudFront → API Gateway → createProduct Lambda
  → DynamoDB PutItem → Response → Client
```

**2. Upload Image:**
```
Client → CloudFront → API Gateway → uploadImage Lambda
  → S3 PutObject → DynamoDB Update → Response → Client
```

**3. Place Order:**
```
Client → CloudFront → API Gateway → createOrder Lambda
  → DynamoDB PutItem → EventBridge PublishEvent
  → processOrderEvent Lambda → DynamoDB Update
  → Response → Client
```

---

## AWS Services

### Lambda Functions

**Characteristics:**
- Runtime: Node.js 18.x
- Memory: 256-512 MB
- Timeout: 10-30 seconds
- Concurrency: Auto-scaling
- Cold start: ~1-2 seconds
- Warm start: ~10-100ms

**Functions:**

| Function | Purpose | Timeout | Memory |
|----------|---------|---------|--------|
| createProduct | Create new product | 10s | 256MB |
| getProducts | List products | 10s | 256MB |
| getProduct | Get single product | 10s | 256MB |
| updateProduct | Update product | 10s | 256MB |
| deleteProduct | Delete product | 10s | 256MB |
| uploadImage | Upload to S3 | 30s | 512MB |
| getCart | Get cart items | 10s | 256MB |
| addToCart | Add to cart | 10s | 256MB |
| updateCartItem | Update quantity | 10s | 256MB |
| removeFromCart | Remove item | 10s | 256MB |
| createOrder | Place order | 30s | 512MB |
| getOrders | List orders | 10s | 256MB |
| getOrder | Get order details | 10s | 256MB |
| processOrderEvent | Async processing | 30s | 512MB |

### API Gateway

**Configuration:**
- Type: REST API
- Protocol: HTTPS only
- Throttling: 10,000 RPS (default)
- Burst: 5,000 requests
- CORS: Enabled for all endpoints
- API Keys: Optional

**Features:**
- Request/response transformation
- Input validation
- Method request/response
- Integration request/response
- Caching (optional)

### DynamoDB

**Products Table:**
```
Table Name: serverless-ecommerce-backend-products-{stage}
Billing Mode: PAY_PER_REQUEST
Primary Key:
  - PK (HASH): PRODUCT#{productId}
  - SK (RANGE): METADATA

Global Secondary Index (GSI1):
  - GSI1PK (HASH): CATEGORY#{category}
  - GSI1SK (RANGE): PRODUCT#{productId}
  
Attributes:
  - productId (String)
  - name (String)
  - description (String)
  - price (Number)
  - category (String)
  - inventory (Number)
  - images (List)
  - createdAt (String - ISO 8601)
  - updatedAt (String - ISO 8601)
```

**Orders Table:**
```
Table Name: serverless-ecommerce-backend-orders-{stage}
Billing Mode: PAY_PER_REQUEST
Primary Key:
  - PK (HASH): USER#{userId}
  - SK (RANGE): ORDER#{orderId}

Global Secondary Index (GSI1):
  - GSI1PK (HASH): ORDER#{orderId}
  - GSI1SK (RANGE): {timestamp}

Attributes:
  - orderId (String)
  - userId (String)
  - items (List)
  - total (Number)
  - shippingAddress (Map)
  - paymentMethod (String)
  - status (String)
  - createdAt (String)
  - updatedAt (String)
```

**Cart Table:**
```
Table Name: serverless-ecommerce-backend-cart-{stage}
Billing Mode: PAY_PER_REQUEST
Primary Key:
  - PK (HASH): USER#{userId}
  - SK (RANGE): ITEM#{itemId}

TTL Attribute: ttl (Unix timestamp)
TTL Enabled: Yes (7 days)

Attributes:
  - itemId (String)
  - productId (String)
  - name (String)
  - quantity (Number)
  - price (Number)
  - addedAt (String)
  - ttl (Number - Unix timestamp)
```

### S3 Bucket

**Configuration:**
```
Bucket Name: serverless-ecommerce-backend-images-{stage}
Region: us-east-1
Versioning: Enabled
Encryption: AES-256
Public Access: Blocked

Folder Structure:
  /products/{productId}/{imageId}.jpg
```

**Access:**
- CloudFront Origin Access Identity (OAI)
- No public access
- Presigned URLs for uploads

### CloudFront Distribution

**Configuration:**
- Origin: S3 bucket
- Protocol: HTTPS only
- Caching: Enabled (max-age: 1 year)
- Compression: Enabled (Gzip, Brotli)
- Price Class: PriceClass_100 (North America, Europe)
- HTTP Version: HTTP/2

**Benefits:**
- Global edge locations
- Sub-100ms image delivery
- Reduced S3 costs
- DDoS protection

### EventBridge

**Event Bus:**
```
Name: serverless-ecommerce-backend-events-{stage}

Events:
  - Source: ecommerce.orders
    DetailType: OrderCreated
    Detail: { orderId, userId, total, itemCount }
```

**Rules:**
```
Rule: ProcessOrderEvents
  Pattern: { source: ["ecommerce.orders"], detail-type: ["OrderCreated"] }
  Target: processOrderEvent Lambda
```

---

## Data Models

### Single-Table Design Pattern

All entities use a single DynamoDB table with generic `PK` and `SK` keys.

**Benefits:**
- Fewer tables to manage
- Efficient queries
- Lower costs
- Better performance

**Access Patterns:**

| Pattern | Key Condition |
|---------|---------------|
| Get product by ID | PK = PRODUCT#{id}, SK = METADATA |
| List products by category | GSI1PK = CATEGORY#{cat} |
| Get user's cart | PK = USER#{userId}, SK begins_with ITEM# |
| Get user's orders | PK = USER#{userId}, SK begins_with ORDER# |
| Get order by ID | GSI1PK = ORDER#{orderId} |

### Entity Relationship Diagram
```
┌────────────┐       ┌────────────┐       ┌────────────┐
│  Product   │       │    Cart    │       │   Order    │
├────────────┤       ├────────────┤       ├────────────┤
│ productId  │◄──────│ productId  │       │  orderId   │
│ name       │       │ quantity   │       │  userId    │
│ price      │       │ price      │       │  items     │
│ category   │       │ userId     │       │  total     │
│ inventory  │       └────────────┘       │  status    │
│ images     │              │             └────────────┘
└────────────┘              │                    ▲
                            │                    │
                            └────────────────────┘
```

---

## API Design

### RESTful Principles

- **Resources**: Products, Cart, Orders
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: 200, 201, 400, 404, 500
- **Idempotency**: PUT and DELETE are idempotent
- **Stateless**: No server-side sessions

### Endpoint Naming
```
/products              # Collection
/products/{id}         # Single resource
/products/{id}/images  # Sub-resource
/cart/items            # Nested collection
/orders                # Collection
```

### Response Format

**Success:**
```json
{
  "message": "Success message",
  "data": { ... },
  "metadata": { ... }
}
```

**Error:**
```json
{
  "error": "Error description",
  "timestamp": "2026-01-27T10:30:00.000Z"
}
```

---

## Security

### Authentication & Authorization

**Current (Demo):**
- Placeholder authentication
- userId passed as parameter

**Production (Recommended):**
- AWS Cognito User Pools
- JWT tokens in Authorization header
- API Gateway authorizer
- User context in Lambda events

### IAM Roles

**Lambda Execution Role:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/serverless-ecommerce-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::serverless-ecommerce-*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "events:PutEvents"
      ],
      "Resource": [
        "arn:aws:events:*:*:event-bus/serverless-ecommerce-*"
      ]
    }
  ]
}
```

### Data Protection

**Encryption at Rest:**
- DynamoDB: AWS-managed keys
- S3: AES-256
- Lambda environment variables: KMS (optional)

**Encryption in Transit:**
- HTTPS only (TLS 1.2+)
- CloudFront to origin
- API Gateway to Lambda

### Input Validation

- Schema validation in middleware
- Type checking (string, number, boolean)
- Range validation (price > 0, quantity > 0)
- String length limits
- SQL injection prevention (NoSQL)

---

## Scalability

### Horizontal Scaling

**Lambda:**
- Auto-scales to 1000 concurrent executions
- Can request limit increase
- Reserved concurrency for critical functions

**DynamoDB:**
- On-demand scaling
- Unlimited read/write capacity
- Auto-scales based on traffic

**API Gateway:**
- 10,000 RPS default
- Can handle millions of requests
- Regional endpoints

### Performance Optimization

**Lambda:**
- Minimize cold starts (keep functions warm)
- Optimize package size
- Reuse connections (DynamoDB client)
- Use Lambda layers for shared code

**DynamoDB:**
- Use Query instead of Scan
- Leverage GSIs for access patterns
- Batch operations where possible
- Connection pooling

**S3/CloudFront:**
- Edge caching
- Image compression
- Lazy loading
- CDN distribution

---

## Monitoring

### CloudWatch Metrics

**Lambda:**
- Invocations
- Duration
- Errors
- Throttles
- Concurrent executions

**DynamoDB:**
- ConsumedReadCapacityUnits
- ConsumedWriteCapacityUnits
- UserErrors
- SystemErrors

**API Gateway:**
- Count (requests)
- 4XXError
- 5XXError
- Latency

### Structured Logging

**Log Format:**
```json
{
  "level": "INFO",
  "message": "Product created",
  "timestamp": "2026-01-27T10:30:00.000Z",
  "productId": "abc123",
  "userId": "user-123"
}
```

---

## Cost Analysis

### Monthly Cost Breakdown

**Development (Low Traffic):**

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 100K requests | $0.20 |
| DynamoDB | 10K reads/writes | $1.25 |
| S3 | 1GB storage | $0.50 |
| API Gateway | 100K requests | $0.35 |
| CloudFront | 10GB transfer | $0.85 |
| **Total** | | **~$3.15/month** |

**Production (Medium Traffic):**

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 1M requests | $4.00 |
| DynamoDB | 100K reads/writes | $12.50 |
| S3 | 10GB storage | $2.50 |
| API Gateway | 1M requests | $3.50 |
| CloudFront | 100GB transfer | $8.50 |
| **Total** | | **~$31/month** |

---

## Design Decisions

### Why Serverless?

**Advantages:**
- No server management
- Auto-scaling
- Pay per use
- High availability
- Fast deployment

**Trade-offs:**
- Cold starts
- Vendor lock-in
- Limited execution time

### Why Single-Table Design?

**Advantages:**
- Efficient queries
- Lower costs
- Better performance
- Atomic transactions

**Trade-offs:**
- Complex planning
- Learning curve

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Author:** Mark Schulze