import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv from backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(uri);
  console.log('Connected.');

  const collection = mongoose.connection.collection('users');

  try {
    console.log('Checking current indexes...');
    const indexes = await collection.indexes();
    console.log('Found indexes:', indexes.map(idx => idx.name));

    // Drop old global unique indexes if they exist
    const indexesToDrop = ['mobile_1', 'email_1'];
    for (const indexName of indexesToDrop) {
      if (indexes.some(idx => idx.name === indexName)) {
        console.log(`Dropping index: ${indexName}`);
        await collection.dropIndex(indexName);
        console.log(`Dropped index: ${indexName} successfully.`);
      }
    }
  } catch (err) {
    console.error('Error during index drop:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
