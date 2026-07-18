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
    bgGradient: { type: String, default: 'linear-gradient(135deg, #4f21db 0%, #7e22ce 100%)' },
    textColor: { type: String, default: '#ffffff' },
    buttonBgColor: { type: String, default: '#ffffff' },
    buttonTextColor: { type: String, default: '#4f21db' },
    isActive: { type: Boolean, default: true },
    isCoupon: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('PromoBanner', promoBannerSchema);
