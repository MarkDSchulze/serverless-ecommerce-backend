const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse } = require('../utils/response');
const { uploadFile } = require('../services/s3');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
const IMAGES_BUCKET = process.env.IMAGES_BUCKET;

/**
 * Upload product image to S3
 */
exports.uploadImage = async (event) => {
  try {
    const { productId } = event.pathParameters;
    
    // Decode base64 image
    const imageData = event.isBase64Encoded 
      ? Buffer.from(event.body, 'base64')
      : event.body;
    
    const imageId = uuidv4();
    const key = `products/${productId}/${imageId}.jpg`;
    
    // Upload to S3
    const result = await uploadFile(
      IMAGES_BUCKET,
      key,
      imageData,
      'image/jpeg'
    );

    // Update product with image URL
    await dynamodb.update({
      TableName: PRODUCTS_TABLE,
      Key: {
        PK: `PRODUCT#${productId}`,
        SK: 'METADATA'
      },
      UpdateExpression: 'SET images = list_append(if_not_exists(images, :empty), :image), updatedAt = :timestamp',
      ExpressionAttributeValues: {
        ':image': [{ id: imageId, url: result.url }],
        ':empty': [],
        ':timestamp': new Date().toISOString()
      }
    }).promise();

    console.log('Image uploaded:', imageId);
    return successResponse(200, {
      message: 'Image uploaded successfully',
      imageUrl: result.url
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return errorResponse(500, 'Failed to upload image');
  }
};

/**
 * Generate presigned URL for direct upload
 */
exports.getUploadUrl = async (event) => {
  try {
    const { productId } = event.pathParameters;
    const imageId = uuidv4();
    const key = `products/${productId}/${imageId}.jpg`;

    const s3 = new AWS.S3();
    const url = s3.getSignedUrl('putObject', {
      Bucket: IMAGES_BUCKET,
      Key: key,
      Expires: 300, // 5 minutes
      ContentType: 'image/jpeg'
    });

    return successResponse(200, {
      uploadUrl: url,
      imageId,
      key
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return errorResponse(500, 'Failed to generate upload URL');
  }
};
