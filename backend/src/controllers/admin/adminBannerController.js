import PromoBanner from '../../models/PromoBanner.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { uploadToS3 } from '../../config/s3.js';
import s3Client from '../../config/s3.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

// List all banners for admin panel
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await PromoBanner.find().sort({ order: 1, createdAt: -1 });
  res.json({ success: true, data: banners });
});

// Create a banner slide
export const createBanner = asyncHandler(async (req, res) => {
  const bannerData = { ...req.body };

  // Pick up R2 URL from upload middleware (set as req.file.filename)
  if (req.file) {
    bannerData.imageUrl = req.file.filename || req.file.cloudinaryUrl || req.file.path;
  }

  const banner = await PromoBanner.create(bannerData);
  res.status(201).json({ success: true, data: banner });
});

// Update a banner slide
export const updateBanner = asyncHandler(async (req, res) => {
  const bannerData = { ...req.body };

  const banner = await PromoBanner.findById(req.params.id);
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

  if (req.file) {
    // Delete old R2 image
    const r2Domain = (process.env.R2_PUBLIC_URL || '').replace(/^https?:\/\//, '');
    if (banner.imageUrl && banner.imageUrl.includes(r2Domain)) {
      try {
        const key = banner.imageUrl.split(r2Domain + '/')[1];
        if (key) await s3Client.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
      } catch (e) { console.error('R2 delete error:', e); }
    }
    bannerData.imageUrl = req.file.filename || req.file.cloudinaryUrl || req.file.path;
  }

  const updated = await PromoBanner.findByIdAndUpdate(req.params.id, bannerData, { new: true });
  res.json({ success: true, data: updated });
});

// Delete a banner slide (also removes R2 image)
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await PromoBanner.findById(req.params.id);
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

  const r2Domain = (process.env.R2_PUBLIC_URL || '').replace(/^https?:\/\//, '');
  if (banner.imageUrl && banner.imageUrl.includes(r2Domain)) {
    try {
      const key = banner.imageUrl.split(r2Domain + '/')[1];
      if (key) await s3Client.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
    } catch (e) { console.error('R2 delete error:', e); }
  }

  await PromoBanner.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Banner deleted successfully' });
});

// Reorder banners — accepts [{id, order}]
export const reorderBanners = asyncHandler(async (req, res) => {
  const { items } = req.body; // [{ id: '...', order: 1 }, ...]
  if (!Array.isArray(items)) return res.status(400).json({ success: false, message: 'items array required' });

  const ops = items.map(({ id, order }) =>
    PromoBanner.findByIdAndUpdate(id, { order })
  );
  await Promise.all(ops);
  res.json({ success: true, message: 'Banners reordered' });
});
