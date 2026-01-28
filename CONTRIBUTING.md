# Contributing to Serverless E-commerce Backend

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

### Our Pledge

We pledge to make participation in this project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## How Can I Contribute?

### Reporting Bugs

**Before submitting a bug report:**
1. Check the [existing issues](https://github.com/YOUR-USERNAME/serverless-ecommerce-backend/issues) to avoid duplicates
2. Collect information about the bug:
   - Stack trace
   - AWS region and stage
   - Node.js version
   - Steps to reproduce
   - Expected vs actual behavior

**Submit a bug report:**
1. Use the GitHub issue tracker
2. Use a clear and descriptive title
3. Provide detailed steps to reproduce
4. Include error messages and logs
5. Explain the expected behavior
6. Include screenshots if applicable

### Suggesting Features

**Before submitting a feature request:**
1. Check if the feature already exists
2. Check the roadmap in README.md
3. Consider if it fits the project scope

**Submit a feature request:**
1. Use the GitHub issue tracker
2. Use a clear and descriptive title
3. Provide a detailed description of the feature
4. Explain why this feature would be useful
5. Provide examples of how it would work

### Contributing Code

**Types of contributions we're looking for:**
- Bug fixes
- New features (discuss in issue first)
- Performance improvements
- Documentation improvements
- Test coverage improvements
- Code refactoring

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- AWS Account with configured credentials
- Git
- Serverless Framework

### Setup Steps
```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/serverless-ecommerce-backend.git
cd serverless-ecommerce-backend

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL-OWNER/serverless-ecommerce-backend.git

# 4. Install dependencies
npm install

# 5. Copy environment template
cp .env.example .env

# 6. Configure AWS credentials
aws configure

# 7. Deploy to your dev environment
npm run deploy:dev

# 8. Run tests
npm test
```

### Development Workflow
```bash
# 1. Create a feature branch
git checkout -b feature/my-new-feature

# 2. Make your changes
# ... edit files ...

# 3. Run tests
npm test
npm run lint

# 4. Commit changes
git add .
git commit -m "feat: add amazing feature"

# 5. Push to your fork
git push origin feature/my-new-feature

# 6. Open a Pull Request on GitHub
```

## Coding Standards

### JavaScript Style Guide

We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some modifications.

**Key principles:**
- Use ES6+ features
- Use `const` by default, `let` when needed, never `var`
- Use meaningful variable names
- Keep functions small and focused (< 50 lines)
- Add JSDoc comments for functions
- Avoid deep nesting (max 3 levels)

**Examples:**
```javascript
// ❌ Bad
function a(b) {
  var c = b * 2;
  return c;
}

// ✅ Good
/**
 * Calculate the double of a number
 * @param {number} value - The input value
 * @returns {number} The doubled value
 */
function calculateDouble(value) {
  const result = value * 2;
  return result;
}
```

### File Organization
```javascript
// 1. External imports
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// 2. Internal imports
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

// 3. Constants
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

// 4. Initialize clients (outside handler for reuse)
const dynamodb = new AWS.DynamoDB.DocumentClient();

// 5. Helper functions
function validateInput(data) {
  // ...
}

// 6. Main handler functions
exports.createProduct = async (event) => {
  // ...
};
```

### Error Handling
```javascript
// Always use try-catch in Lambda handlers
exports.handler = async (event) => {
  try {
    // Your code here
    const result = await someAsyncOperation();
    return successResponse(200, result);
  } catch (error) {
    // Log the error
    logger.error('Operation failed', { error: error.message, stack: error.stack });
    
    // Return appropriate error response
    return errorResponse(500, 'Operation failed');
  }
};
```

### Environment Variables
```javascript
// ✅ Good - with fallback
const tableName = process.env.PRODUCTS_TABLE || 'default-table';

// ❌ Bad - no validation
const tableName = process.env.PRODUCTS_TABLE;
```

## Testing Guidelines

### Test Structure
```javascript
describe('Feature Name', () => {
  // Setup
  beforeEach(() => {
    // Initialize test data
  });

  // Cleanup
  afterEach(() => {
    // Clean up resources
  });

  test('should do something specific', () => {
    // Arrange
    const input = { name: 'Test' };
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe('Test');
  });
});
```

### Test Coverage Requirements

- **Overall**: 75% minimum
- **New features**: 80% minimum
- **Critical paths**: 90% minimum
- **Utility functions**: 100%

### Writing Good Tests
```javascript
// ✅ Good - descriptive name, clear assertion
test('should return 404 when product does not exist', () => {
  const result = getProduct('non-existent-id');
  expect(result.statusCode).toBe(404);
});

// ❌ Bad - vague name, unclear assertion
test('test1', () => {
  const result = getProduct('123');
  expect(result).toBeTruthy();
});
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/unit/products.test.js

# Run in watch mode
npm run test:watch
```

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring (no functional changes)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD changes

### Examples
```bash
# Simple feature
git commit -m "feat: add product search endpoint"

# Bug fix with description
git commit -m "fix: resolve cart item quantity update issue

The quantity was not being updated correctly due to
incorrect DynamoDB update expression."

# Breaking change
git commit -m "feat!: change API response format

BREAKING CHANGE: API responses now include metadata object"
```

### Scope (Optional)
```bash
git commit -m "feat(products): add image upload functionality"
git commit -m "fix(cart): resolve TTL calculation error"
git commit -m "docs(readme): update deployment instructions"
```

## Pull Request Process

### Before Submitting

**Checklist:**
- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Added tests for new features
- [ ] Updated documentation if needed
- [ ] Commit messages follow convention
- [ ] No merge conflicts with main branch

### Submitting a Pull Request

1. **Create a descriptive title**
```
   feat: Add product search with ElasticSearch
```

2. **Fill out the PR template**
   - What changes does this PR introduce?
   - Why is this change needed?
   - How has this been tested?
   - Screenshots (if UI changes)
   - Related issues

3. **Link related issues**
```
   Closes #123
   Relates to #456
```

4. **Request review**
   - Tag relevant reviewers
   - Respond to feedback promptly
   - Make requested changes

### Review Process

**Reviewers will check:**
- Code quality and style
- Test coverage
- Documentation updates
- Performance implications
- Security considerations
- AWS best practices

**Timeline:**
- Initial review: 1-2 business days
- Follow-up reviews: 1 business day
- Merge: After approval from 1+ maintainers

### After Merge

1. Delete your feature branch
2. Update your local main branch
3. Close related issues if not auto-closed
```bash
# Update local repository
git checkout main
git pull upstream main
git push origin main

# Delete feature branch
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

## Development Best Practices

### AWS Best Practices

- Use IAM roles with least privilege
- Enable encryption at rest and in transit
- Use environment variables for configuration
- Implement proper error handling
- Add CloudWatch logging
- Use AWS SDK connection pooling

### Serverless Best Practices

- Keep Lambda functions small and focused
- Reuse connections (DynamoDB, S3 clients)
- Minimize package size
- Use environment variables
- Implement graceful degradation
- Add proper monitoring

### DynamoDB Best Practices

- Use single-table design where appropriate
- Prefer Query over Scan
- Use consistent naming for keys
- Implement optimistic locking for updates
- Use batch operations when possible
- Add appropriate indexes (GSI, LSI)

## Questions?

- Open an issue for questions
- Check existing documentation
- Review closed PRs for examples
- Contact maintainers

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing! 🎉
