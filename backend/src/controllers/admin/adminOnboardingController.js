import OnboardingSlide from '../../models/OnboardingSlide.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { uploadToS3 } from '../../config/s3.js';
import s3Client from '../../config/s3.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

// List all onboarding slides for admin
export const getOnboardingSlidesAdmin = asyncHandler(async (req, res) => {
  const slides = await OnboardingSlide.find({}).sort({ order: 1 });
  res.json({ success: true, data: slides });
});

// Create new onboarding slide
export const createOnboardingSlide = asyncHandler(async (req, res) => {
  const { title, description, order } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and description are required' });
  }

  let imageUrl = '';
  if (req.file) {
    // Upload directly to onboarding student prefix in R2
    imageUrl = await uploadToS3(
      req.file.buffer,
      'onboarding/student',
      req.file.originalname || 'slide',
      req.file.mimetype
    );
  } else if (req.body.imageUrl) {
    imageUrl = req.body.imageUrl;
  } else {
    return res.status(400).json({ success: false, message: 'Image file or imageUrl is required' });
  }

  const slide = await OnboardingSlide.create({
    title,
    description,
    imageUrl,
    order: Number(order) || 0,
    isActive: true
  });

  res.status(201).json({ success: true, data: slide });
});

// Update existing onboarding slide
export const updateOnboardingSlide = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, order, isActive } = req.body;

  const slide = await OnboardingSlide.findById(id);
  if (!slide) {
    return res.status(404).json({ success: false, message: 'Onboarding slide not found' });
  }

  if (title) slide.title = title;
  if (description) slide.description = description;
  if (order !== undefined) slide.order = Number(order);
  if (isActive !== undefined) slide.isActive = isActive === 'true' || isActive === true;

  if (req.file) {
    // Delete old R2 image if it was hosted on our bucket
    const r2Domain = (process.env.R2_PUBLIC_URL || '').replace(/^https?:\/\//, '');
    if (slide.imageUrl && slide.imageUrl.includes(r2Domain)) {
      try {
        const key = slide.imageUrl.split(r2Domain + '/')[1];
        if (key) {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key
          }));
        }
      } catch (err) {
        console.error("Failed to delete old slide image from R2:", err);
      }
    }

    // Upload new image
    slide.imageUrl = await uploadToS3(
      req.file.buffer,
      'onboarding/student',
      req.file.originalname || 'slide',
      req.file.mimetype
    );
  } else if (req.body.imageUrl) {
    slide.imageUrl = req.body.imageUrl;
  }

  await slide.save();
  res.json({ success: true, data: slide });
});

// Delete onboarding slide
export const deleteOnboardingSlide = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const slide = await OnboardingSlide.findById(id);
  if (!slide) {
    return res.status(404).json({ success: false, message: 'Onboarding slide not found' });
  }

  // Delete R2 image
  const r2Domain = (process.env.R2_PUBLIC_URL || '').replace(/^https?:\/\//, '');
  if (slide.imageUrl && slide.imageUrl.includes(r2Domain)) {
    try {
      const key = slide.imageUrl.split(r2Domain + '/')[1];
      if (key) {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key
        }));
      }
    } catch (err) {
      console.error("Failed to delete slide image from R2:", err);
    }
  }

  await OnboardingSlide.findByIdAndDelete(id);
  res.json({ success: true, message: 'Onboarding slide deleted successfully' });
});
