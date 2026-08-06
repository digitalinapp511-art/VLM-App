import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CashbackOffer from './src/models/CashbackOffer.js';

dotenv.config();

async function checkOffers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const offers = await CashbackOffer.find({});
    console.log('Total Cashback Offers in DB:', offers.length);
    console.log(JSON.stringify(offers, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkOffers();
