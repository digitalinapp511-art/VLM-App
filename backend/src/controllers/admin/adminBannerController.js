import PromoBanner from '../../models/PromoBanner.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

// List all banners for admin panel
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await PromoBanner.find().sort({ order: 1, createdAt: -1 });
  res.json({ success: true, data: banners });
});

// Create a banner slide
export const createBanner = asyncHandler(async (req, res) => {
  const bannerData = { ...req.body };
  
  if (req.file && req.file.s3Url) {
    bannerData.imageUrl = req.file.s3Url;
  }

  const banner = await PromoBanner.create(bannerData);
  res.status(201).json({ success: true, data: banner });
});

// Update a banner slide
export const updateBanner = asyncHandler(async (req, res) => {
  const bannerData = { ...req.body };

  if (req.file && req.file.s3Url) {
    bannerData.imageUrl = req.file.s3Url;
  }

  const banner = await PromoBanner.findByIdAndUpdate(req.params.id, bannerData, { new: true });
  if (!banner) {
    return res.status(404).json({ success: false, message: 'Banner not found' });
  }

  res.json({ success: true, data: banner });
});

// Delete a banner slide
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await PromoBanner.findByIdAndDelete(req.params.id);
  if (!banner) {
    return res.status(404).json({ success: false, message: 'Banner not found' });
  }
  res.json({ success: true, message: 'Banner deleted successfully' });
});
