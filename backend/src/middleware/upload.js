import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { uploadToS3 } from '../config/s3.js';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|mp4|webm|mkv|mov|avi|mp3|wav|m4a/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype) || file.mimetype.includes('pdf') || file.mimetype.includes('video') || file.mimetype.includes('audio');
    cb(null, ext || mime);
  },
});

function resolveFolder(req, file) {
  const routePath = req.originalUrl || '';

  // Banners → vlm-academy/banners/
  if (routePath.includes('/banners')) return 'banners';

  // Onboarding slides → vlm-academy/onboarding/student/
  if (routePath.includes('/onboarding')) return 'onboarding/student';

  // Study resources or upload endpoints
  if (routePath.includes('/resources') || routePath.includes('/upload') || routePath.includes('/study-library')) {
    const className = req.query.className || req.body.className || req.params.className || 'General';
    const subject = req.query.subject || req.body.subject || req.body.subjectName || 'General';
    
    let folderType = 'documents';
    if (file.mimetype.startsWith('video/')) {
      folderType = 'videos';
    } else if (file.mimetype.startsWith('audio/')) {
      folderType = 'audios';
    }

    // Sanitize values to prevent path injection/malformed folder names
    const cleanClass = className.replace(/[\/\\?%*:|"<>]/g, '').trim() || 'General';
    const cleanSubject = subject.replace(/[\/\\?%*:|"<>]/g, '').trim() || 'General';

    return `study-material/${cleanClass}/${cleanSubject}/${folderType}`;
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

/**
 * Middleware to convert uploaded PNG/JPEG images into highly optimized WebP format
 */
export const compressImageToWebp = async (req, res, next) => {
  try {
    // 1. Process single file upload (req.file)
    if (req.file && req.file.mimetype.startsWith('image/') && !req.file.mimetype.includes('gif')) {
      const convertedBuffer = await sharp(req.file.buffer)
        .webp({ quality: 80 })
        .toBuffer();
      
      req.file.buffer = convertedBuffer;
      req.file.mimetype = 'image/webp';
      
      const parsedPath = path.parse(req.file.originalname);
      req.file.originalname = `${parsedPath.name}.webp`;
    }

    // 2. Process multiple file uploads (req.files)
    if (req.files && typeof req.files === 'object') {
      const fileKeys = Object.keys(req.files);
      for (const key of fileKeys) {
        const fileList = req.files[key];
        if (Array.isArray(fileList)) {
          for (const file of fileList) {
            if (file.mimetype.startsWith('image/') && !file.mimetype.includes('gif')) {
              const convertedBuffer = await sharp(file.buffer)
                .webp({ quality: 80 })
                .toBuffer();
              
              file.buffer = convertedBuffer;
              file.mimetype = 'image/webp';
              
              const parsedPath = path.parse(file.originalname);
              file.originalname = `${parsedPath.name}.webp`;
            }
          }
        }
      }
    }
    
    next();
  } catch (err) {
    console.error('Error converting image to WebP with Sharp:', err);
    // Safe fallback: continue with original uncompressed upload if conversion fails
    next();
  }
};
