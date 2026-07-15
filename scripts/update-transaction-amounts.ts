import 'dotenv/config';
import mongoose from 'mongoose';
import { TransactionSchema } from '../src/transactions/schemas/transaction.schema';

const BATCH_SIZE = 500;

function signedAmount(magnitude: number, transferType: string): number {
  const abs = Math.abs(magnitude);
  if (transferType === 'deposit') return abs;
  if (transferType === 'withdrawal' || transferType === 'payment') return -abs;
  return Math.random() < 0.5 ? abs : -abs; // transfer
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');

  await mongoose.connect(uri);
  const TransactionModel = mongoose.model('Transaction', TransactionSchema);

  const total = await TransactionModel.countDocuments();
  console.log(`Updating amounts for ${total} transactions...`);

  const cursor = TransactionModel.find().cursor();
  let batch: { updateOne: { filter: { _id: unknown }; update: { $set: { amount: number } } } }[] = [];
  let updated = 0;

  for await (const doc of cursor) {
    const amount = signedAmount(doc.amount, doc.transferType);
    batch.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { amount } },
      },
    });

    if (batch.length >= BATCH_SIZE) {
      await TransactionModel.bulkWrite(batch, { ordered: false });
      updated += batch.length;
      console.log(`Updated ${updated}/${total}`);
      batch = [];
    }
  }

  if (batch.length) {
    await TransactionModel.bulkWrite(batch, { ordered: false });
    updated += batch.length;
    console.log(`Updated ${updated}/${total}`);
  }

  console.log('Done updating amounts.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
