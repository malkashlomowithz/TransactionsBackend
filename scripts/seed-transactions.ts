import 'dotenv/config';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import {
  TransactionSchema,
  TRANSFER_TYPES,
} from '../src/transactions/schemas/transaction.schema';

const TOTAL = 10000;
const BATCH_SIZE = 1000;

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');

  await mongoose.connect(uri);
  const TransactionModel = mongoose.model('Transaction', TransactionSchema);

  console.log(`Seeding ${TOTAL} transactions...`);

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, TOTAL - i);
    const batch = Array.from({ length: batchSize }, () => ({
      transactionId: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      amount: faker.number.float({ min: 1, max: 5000, fractionDigits: 2 }),
      transferType: faker.helpers.arrayElement(TRANSFER_TYPES),
      cardLastFour: faker.string.numeric(4),
    }));

    await TransactionModel.insertMany(batch);
    console.log(`Inserted ${i + batch.length}/${TOTAL}`);
  }

  console.log('Done seeding.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
