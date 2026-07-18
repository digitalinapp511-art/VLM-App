import { asyncHandler } from '../../middleware/errorHandler.js';
import CashbackOffer from '../../models/CashbackOffer.js';

// ── GET all cashback offers (with filters) ────────────────────────────────────
export const getCashbackOffers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;

  const [offers, total] = await Promise.all([
    CashbackOffer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    CashbackOffer.countDocuments(query),
  ]);

  res.json({ success: true, data: offers, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// ── GET single cashback offer ─────────────────────────────────────────────────
export const getCashbackOffer = asyncHandler(async (req, res) => {
  const offer = await CashbackOffer.findById(req.params.id);
  if (!offer) return res.status(404).json({ success: false, message: 'Cashback offer not found' });
  res.json({ success: true, data: offer });
});

// ── CREATE cashback offer ─────────────────────────────────────────────────────
export const createCashbackOffer = asyncHandler(async (req, res) => {
  const {
    title, description, recommendedText,
    minRechargeAmount, cashbackAmount, cashbackPercent, maxCashback,
    isActive, validFrom, validUntil, usageLimit, perUserLimit, applicablePlans,
  } = req.body;

  if (!title || !minRechargeAmount || (!cashbackAmount && !cashbackPercent)) {
    return res.status(400).json({
      success: false,
      message: 'title, minRechargeAmount, and cashbackAmount (or cashbackPercent) are required',
    });
  }

  const offer = await CashbackOffer.create({
    title,
    description: description || '',
    recommendedText: recommendedText || '',
    minRechargeAmount,
    cashbackAmount: cashbackAmount || 0,
    cashbackPercent: cashbackPercent || 0,
    maxCashback: maxCashback || 0,
    isActive: isActive !== undefined ? isActive : true,
    validFrom: validFrom || new Date(),
    validUntil: validUntil || null,
    usageLimit: usageLimit || 0,
    perUserLimit: perUserLimit || 0,
    applicablePlans: applicablePlans || [],
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: offer, message: 'Cashback offer created successfully' });
});

// ── UPDATE cashback offer ─────────────────────────────────────────────────────
export const updateCashbackOffer = asyncHandler(async (req, res) => {
  const offer = await CashbackOffer.findById(req.params.id);
  if (!offer) return res.status(404).json({ success: false, message: 'Cashback offer not found' });

  const fields = [
    'title', 'description', 'recommendedText',
    'minRechargeAmount', 'cashbackAmount', 'cashbackPercent', 'maxCashback',
    'isActive', 'validFrom', 'validUntil', 'usageLimit', 'perUserLimit', 'applicablePlans',
  ];
  fields.forEach(f => { if (req.body[f] !== undefined) offer[f] = req.body[f]; });
  await offer.save();

  res.json({ success: true, data: offer, message: 'Cashback offer updated successfully' });
});

// ── DELETE cashback offer ─────────────────────────────────────────────────────
export const deleteCashbackOffer = asyncHandler(async (req, res) => {
  const offer = await CashbackOffer.findByIdAndDelete(req.params.id);
  if (!offer) return res.status(404).json({ success: false, message: 'Cashback offer not found' });
  res.json({ success: true, message: 'Cashback offer deleted' });
});

// ── TOGGLE active status ──────────────────────────────────────────────────────
export const toggleCashbackOffer = asyncHandler(async (req, res) => {
  const offer = await CashbackOffer.findById(req.params.id);
  if (!offer) return res.status(404).json({ success: false, message: 'Cashback offer not found' });
  offer.isActive = !offer.isActive;
  await offer.save();
  res.json({ success: true, data: offer, message: `Offer ${offer.isActive ? 'activated' : 'deactivated'}` });
});
