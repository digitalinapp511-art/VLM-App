import mongoose from 'mongoose';

const promoBannerSchema = new mongoose.Schema(
  {
    tag: { type: String, default: 'NEW' },
    title: { type: String, required: true },
    highlightWord: { type: String },
    description: { type: String, required: true },
    buttonText: { type: String, default: 'Explore Now' },
    buttonLink: { type: String, default: '/library' },
    imageUrl: { type: String, default: '/avatar.png' },
    isActive: { type: Boolean, default: true },
    isCoupon: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('PromoBanner', promoBannerSchema);
