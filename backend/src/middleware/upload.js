import multer from 'multer';
import path from 'path';
import { uploadToCloudinary as cloudinaryUpload } from '../config/cloudinary.js';

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
 * Middleware to upload a parsed file to Cloudinary.
 * Expects multer middleware (e.g. upload.single(...)) to have run first.
 * Automatically detects folder based on mimetype.
 */
export const cloudinaryUploadMiddleware = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    let folder = 'documents';
    let resourceType = 'auto';

    if (req.file.mimetype.startsWith('image/')) {
      folder = 'profiles';
      resourceType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      folder = 'videos';
      resourceType = 'video';
    } else if (req.file.mimetype.startsWith('audio/')) {
      folder = 'recordings';
      resourceType = 'video';
    } else if (req.file.mimetype === 'application/pdf') {
      folder = 'documents';
      resourceType = 'raw';
    }

    const result = await cloudinaryUpload(req.file.buffer, folder, resourceType);
    
    // Assign the Cloudinary URL to req.file
    req.file.filename = result.secure_url;
    req.file.path = result.secure_url;
    req.file.cloudinaryUrl = result.secure_url;
    
    next();
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ success: false, message: 'File upload failed' });
  }
};

export const getFileUrl = (filename, folder = 'documents') => {
  if (filename && (filename.startsWith('http://') || filename.startsWith('https://'))) {
    return filename;
  }
  return `/uploads/${folder}/${filename}`;
};
