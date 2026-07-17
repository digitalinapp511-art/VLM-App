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
 * Middleware to upload a parsed file to Cloudflare R2 / S3.
 * Automatically detects folder based on mimetype.
 */
export const cloudinaryUploadMiddleware = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    let folder = 'documents';

    if (req.file.mimetype.startsWith('image/')) {
      const role = req.user?.role || 'user';
      folder = `profiles/${role}s`;
    } else if (req.file.mimetype.startsWith('video/')) {
      folder = 'videos';
    } else if (req.file.mimetype.startsWith('audio/')) {
      folder = 'recordings';
    } else if (req.file.mimetype === 'application/pdf') {
      folder = 'documents';
    }

    const publicUrl = await uploadToS3(
      req.file.buffer,
      folder,
      req.file.originalname || 'file',
      req.file.mimetype
    );
    
    // Assign S3 URL to req.file fields to maintain backward compatibility
    req.file.filename = publicUrl;
    req.file.path = publicUrl;
    req.file.cloudinaryUrl = publicUrl;
    req.file.s3Url = publicUrl;
    
    next();
  } catch (err) {
    console.error('S3/R2 upload error:', err);
    res.status(500).json({ success: false, message: 'File upload failed', error: err.message || err });
  }
};

export const getFileUrl = (filename, folder = 'documents') => {
  return filename;
};
