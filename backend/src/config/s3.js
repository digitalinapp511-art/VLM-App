import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getIntegrationConfig } from '../services/integrationService.js';

const getS3ClientAndConfig = async () => {
  const config = await getIntegrationConfig('integration_cloudflare_r2');
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: config.R2_ENDPOINT,
    credentials: {
      accessKeyId: config.R2_ACCESS_KEY_ID || '',
      secretAccessKey: config.R2_SECRET_ACCESS_KEY || '',
    },
  });
  return { s3Client, config };
};

/**
 * Lists objects under a prefix inside the bucket.
 * @param {string} prefix - The prefix to search under
 * @returns {Promise<Array>} List of objects found
 */
export const listR2Objects = async (prefix) => {
  const { s3Client, config } = await getS3ClientAndConfig();
  const command = new ListObjectsV2Command({
    Bucket: config.R2_BUCKET_NAME,
    Prefix: prefix,
  });
  const response = await s3Client.send(command);
  return response.Contents || [];
};

/**
 * Uploads a file buffer to S3 / Cloudflare R2.
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Destination folder / prefix
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File mimetype
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export const uploadToS3 = async (buffer, folder = 'documents', fileName, mimeType) => {
  const { s3Client, config } = await getS3ClientAndConfig();
  const cleanFileName = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
  const key = `vlm-academy/${folder}/${cleanFileName}`;

  const command = new PutObjectCommand({
    Bucket: config.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Build the public URL
  const base = (config.R2_PUBLIC_URL || '').replace(/\/$/, '');
  return `${base}/${key}`;
};

// Default export for backwards compatibility
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://placeholder.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'placeholder',
  },
});

export default s3Client;
