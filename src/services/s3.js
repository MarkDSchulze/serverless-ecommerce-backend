const AWS = require('aws-sdk');
const logger = require('../utils/logger');

const s3 = new AWS.S3();

/**
 * Upload file to S3
 */
async function uploadFile(bucket, key, body, contentType = 'application/octet-stream') {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'max-age=31536000', // Cache for 1 year
  };

  try {
    await s3.putObject(params).promise();
    logger.info('File uploaded to S3', { bucket, key });
    
    return {
      bucket,
      key,
      url: `https://${bucket}.s3.amazonaws.com/${key}`,
    };
  } catch (error) {
    logger.error('S3 upload failed', { bucket, key, error: error.message });
    throw error;
  }
}

/**
 * Get file from S3
 */
async function getFile(bucket, key) {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const result = await s3.getObject(params).promise();
    logger.debug('File retrieved from S3', { bucket, key });
    return result.Body;
  } catch (error) {
    logger.error('S3 get failed', { bucket, key, error: error.message });
    throw error;
  }
}

/**
 * Delete file from S3
 */
async function deleteFile(bucket, key) {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
    logger.info('File deleted from S3', { bucket, key });
  } catch (error) {
    logger.error('S3 delete failed', { bucket, key, error: error.message });
    throw error;
  }
}

/**
 * Generate presigned URL for direct upload
 */
function getPresignedUrl(bucket, key, expiresIn = 3600) {
  const params = {
    Bucket: bucket,
    Key: key,
    Expires: expiresIn,
  };

  try {
    const url = s3.getSignedUrl('putObject', params);
    logger.debug('Presigned URL generated', { bucket, key });
    return url;
  } catch (error) {
    logger.error('Presigned URL generation failed', { bucket, key, error: error.message });
    throw error;
  }
}

module.exports = {
  uploadFile,
  getFile,
  deleteFile,
  getPresignedUrl,
};
