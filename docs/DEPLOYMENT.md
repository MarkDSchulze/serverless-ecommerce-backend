# Deployment Guide

Complete guide to deploy the Serverless E-commerce Backend to AWS.

## Prerequisites

### Required Software

1. **Node.js** 18.x or higher
```bash
   node --version  # Should be v18.x.x or higher
```

2. **npm** 9.x or higher
```bash
   npm --version
```

3. **AWS CLI** configured
```bash
   aws --version
   aws configure list
```

4. **Serverless Framework**
```bash
   npm install -g serverless
   serverless --version
```

### AWS Account Setup

1. Create an AWS account at https://aws.amazon.com
2. Create an IAM user with admin access
3. Generate access keys for programmatic access

## Step 1: Configure AWS Credentials
```bash
# Configure AWS CLI
aws configure

# Enter your credentials when prompted:
# AWS Access Key ID: YOUR_ACCESS_KEY_ID
# AWS Secret Access Key: YOUR_SECRET_ACCESS_KEY
# Default region name: us-east-1
# Default output format: json
```

**Verify configuration:**
```bash
aws sts get-caller-identity
```

You should see your account ID and user ARN.

## Step 2: Install Dependencies
```bash
# Navigate to project directory
cd serverless-ecommerce-backend

# Install dependencies
npm install
```

## Step 3: Deploy to Development
```bash
# Deploy to dev environment
npm run deploy:dev

# Or use serverless directly
serverless deploy --stage dev
```

**Deployment takes 2-5 minutes** and creates:
- Lambda functions
- API Gateway
- DynamoDB tables
- S3 bucket
- CloudFront distribution
- EventBridge event bus
- IAM roles

## Step 4: View Deployment Output

After successful deployment:
```
✔ Service deployed to stack serverless-ecommerce-backend-dev (123s)

endpoints:
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/products
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/products
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/products/{productId}
  PUT - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/products/{productId}
  DELETE - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/products/{productId}
  ...

functions:
  createProduct: serverless-ecommerce-backend-dev-createProduct (5.2 MB)
  getProducts: serverless-ecommerce-backend-dev-getProducts (5.2 MB)
  ...
```

**Save your API URL!** You'll need it for testing.

## Step 5: Test the Deployment
```bash
# Set your API URL as a variable
export API_URL="https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev"

# Test creating a product
curl -X POST $API_URL/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "This is a test",
    "price": 29.99,
    "category": "Electronics",
    "inventory": 100
  }'

# Test getting products
curl $API_URL/products
```

## Step 6: Seed Sample Data (Optional)
```bash
# Set the table name
export PRODUCTS_TABLE=serverless-ecommerce-backend-products-dev

# Run seed script
node scripts/seed-data.js
```

This adds 8 sample products to your database.

## Deploy to Production
```bash
# Deploy to production environment
npm run deploy:prod

# Or
serverless deploy --stage prod
```

**Production deployment:**
- Uses separate AWS resources
- Different DynamoDB tables
- Separate S3 bucket
- Production-grade settings

## View Logs
```bash
# Tail logs for a specific function
serverless logs -f createProduct --tail --stage dev

# View recent logs (last 5 minutes)
serverless logs -f createProduct --startTime 5m --stage dev

# Filter logs for errors
serverless logs -f createProduct --filter ERROR --stage dev
```

## Update a Single Function

**Faster than full deployment** when you only change one function:
```bash
serverless deploy function -f createProduct --stage dev
```

This takes ~10 seconds instead of 2-5 minutes.

## Environment-Specific Configuration

### Development
- Lower costs
- Faster iterations
- Debug logging enabled

### Production
- Higher performance
- Enhanced monitoring
- Stricter security

## Remove/Delete Everything

⚠️ **Warning:** This deletes ALL resources including data!
```bash
# Remove development environment
serverless remove --stage dev

# Or
npm run remove:dev
```

This deletes:
- All Lambda functions
- API Gateway
- DynamoDB tables (and all data!)
- S3 bucket (and all images!)
- CloudFront distribution
- EventBridge event bus
- IAM roles

## Monitoring

### CloudWatch Dashboard

1. Go to AWS Console → CloudWatch
2. View metrics for:
   - Lambda invocations
   - API Gateway requests
   - DynamoDB read/write capacity
   - Error rates

### Custom Metrics
```bash
# View all metrics for your stack
aws cloudwatch list-metrics \
  --namespace AWS/Lambda \
  --dimensions Name=FunctionName,Value=serverless-ecommerce-backend-dev-createProduct
```

## Troubleshooting

### Error: "User is not authorized"

**Problem:** AWS credentials not configured

**Solution:**
```bash
aws configure
# Enter your access key and secret key
```

### Error: "Stack already exists"

**Problem:** Trying to deploy when stack exists

**Solution:**
```bash
# Remove existing stack
serverless remove --stage dev

# Deploy again
serverless deploy --stage dev
```

### Error: "Rate exceeded"

**Problem:** Too many API calls to AWS

**Solution:** Wait 1-2 minutes and try again

### Error: "Timeout"

**Problem:** Function execution exceeded timeout

**Solution:** Increase timeout in `serverless.yml`:
```yaml
functions:
  createProduct:
    timeout: 30  # Increase from 10 to 30 seconds
```

### Error: "No space left on device"

**Problem:** Lambda package too large

**Solution:** The package is automatically optimized, but if needed:
```bash
# Check package size
du -sh .serverless/*.zip

# Should be under 50MB
```

## Cost Monitoring

### View Current Costs
```bash
# Using AWS CLI
aws ce get-cost-and-usage \
  --time-period Start=2026-01-01,End=2026-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### Set Up Billing Alerts

1. Go to AWS Console → Billing → Billing Preferences
2. Enable "Receive Billing Alerts"
3. Go to CloudWatch → Alarms → Create Alarm
4. Set threshold (e.g., $10/month)
5. Enter email for notifications

### Estimated Monthly Costs

**Low Traffic** (< 10,000 requests/month):
- Lambda: $1-2
- DynamoDB: $1-3
- S3: $0.50
- API Gateway: $0.50
- CloudFront: $1
- **Total: $5-10/month**

**Medium Traffic** (100,000 requests/month):
- Lambda: $5-10
- DynamoDB: $10-15
- S3: $2
- API Gateway: $3
- CloudFront: $5
- **Total: $25-35/month**

## CI/CD with GitHub Actions

The project includes automated deployment via GitHub Actions.

### Setup

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### Automatic Deployment

- **Push to `main` branch** → Deploys to production
- **Pull Request** → Runs tests only

### Manual Deployment
```bash
# From your local machine
git push origin main

# GitHub Actions will automatically:
# 1. Run tests
# 2. Deploy to AWS
# 3. Notify you of results
```

## Security Best Practices

1. **Never commit** `.env` files or AWS credentials
2. **Use IAM roles** with least privilege
3. **Enable CloudTrail** for audit logging
4. **Rotate credentials** regularly
5. **Enable MFA** on AWS account
6. **Use AWS Secrets Manager** for sensitive data

## Backup Strategy

### DynamoDB Backups
```bash
# Enable point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name serverless-ecommerce-backend-products-dev \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### S3 Versioning

Already enabled in `serverless.yml` for image bucket.

## Next Steps

1. ✅ Deploy to development
2. ✅ Test all endpoints
3. ✅ Seed sample data
4. ✅ Monitor logs and metrics
5. Configure custom domain (Route 53)
6. Set up AWS WAF for security
7. Enable X-Ray for tracing
8. Deploy to production

## Support

- **AWS Documentation**: https://docs.aws.amazon.com
- **Serverless Framework Docs**: https://www.serverless.com/framework/docs
- **GitHub Issues**: Open an issue in the repository

---

**Congratulations!** Your serverless e-commerce backend is now live! 🎉
