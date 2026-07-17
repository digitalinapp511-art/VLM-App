import multer from 'multer';
import path from 'path';
import { uploadToS3 } from '../config/s3.js';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|mp4|webm|mp3|wav|m4a/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype) || file.mimetype.includes('pdf');
    cb(null, ext || mime);
  },
});

/**
 * Determines upload folder for a file based on route and mimetype.
 */
function resolveFolder(req, file) {
  const routePath = req.originalUrl || '';

  // Banners → vlm-academy/banners/
  if (routePath.includes('/banners')) return 'banners';

  // Onboarding slides → vlm-academy/onboarding/student/
  if (routePath.includes('/onboarding')) return 'onboarding/student';

  // Study resources
  if (routePath.includes('/resources')) {
    if (file.mimetype.startsWith('video/')) return 'study-material/videos';
    return 'study-material/documents';
  }

  // Mimetype fallback
  if (file.mimetype.startsWith('image/')) {
    const role = req.user?.role || 'user';
    return `profiles/${role}s`;
  }
  if (file.mimetype.startsWith('video/')) return 'videos';
  if (file.mimetype.startsWith('audio/')) return 'recordings';
  return 'documents';
}

/**
 * Uploads a single file object to R2 and enriches it with the public URL.
 */
async function uploadFileToR2(req, file) {
  const folder = resolveFolder(req, file);
  const publicUrl = await uploadToS3(
    file.buffer,
    folder,
    file.originalname || 'file',
    file.mimetype
  );
  file.filename = publicUrl;
  file.path = publicUrl;
  file.cloudinaryUrl = publicUrl;
  file.s3Url = publicUrl;
  return publicUrl;
}

/**
 * Middleware to upload file(s) to Cloudflare R2.
 * Handles both upload.single() (req.file) and upload.fields() (req.files).
 */
export const cloudinaryUploadMiddleware = async (req, res, next) => {
  try {
    // Case 1: single file upload
    if (req.file) {
      await uploadFileToR2(req, req.file);
      return next();
    }

    // Case 2: multiple fields (upload.fields())
    if (req.files && typeof req.files === 'object') {
      const uploadPromises = [];
      for (const fieldFiles of Object.values(req.files)) {
        for (const f of fieldFiles) {
          uploadPromises.push(uploadFileToR2(req, f));
        }
      }
      await Promise.all(uploadPromises);

      // Flatten to req.file for backward compat — use first file found
      const allFiles = Object.values(req.files).flat();
      if (allFiles.length > 0) req.file = allFiles[0];

      return next();
    }

    // No file uploaded
    return next();
  } catch (err) {
    console.error('S3/R2 upload error:', err);
    res.status(500).json({ success: false, message: 'File upload failed', error: err.message || err });
  }
};

export const getFileUrl = (filename, folder = 'documents') => {
  return filename;
};
