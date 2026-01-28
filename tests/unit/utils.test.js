const { successResponse, errorResponse } = require('../../src/utils/response');

describe('Response Utilities', () => {
  test('should create success response', () => {
    const response = successResponse(200, { message: 'Success' });
    
    expect(response.statusCode).toBe(200);
    expect(response.headers['Content-Type']).toBe('application/json');
    
    const body = JSON.parse(response.body);
    expect(body.message).toBe('Success');
  });

  test('should create error response', () => {
    const response = errorResponse(404, 'Not found');
    
    expect(response.statusCode).toBe(404);
    expect(response.headers['Content-Type']).toBe('application/json');
    
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Not found');
    expect(body.timestamp).toBeDefined();
  });

  test('should include CORS headers', () => {
    const response = successResponse(200, {});
    
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });
});
