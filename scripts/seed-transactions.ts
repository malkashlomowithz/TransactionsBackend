import 'dotenv/config';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import {
  TransactionSchema,
  TRANSFER_TYPES,
} from '../src/transactions/schemas/transaction.schema';

const TOTAL = 10000;
const BATCH_SIZE = 1000;

const DESCRIPTIONS = [
  'Bank Transfer',
  'Isracard Ltd.',
  'ATM Withdrawal',
  'Cal',
  'Max Credit Card',
  'Bit Transfer',
  'Torah Institutions Fund',
  'Meuhedet Health Fund',
  'Clalit Health Fund',
  'Chen Hahoraah (Non-Profit)',
  'Extended Payment Plan',
  'Credit',
  'Check',
  'Standing Order',
  'Direct Deposit',
  'Salary Deposit',
  'Wire Transfer',
  'Utility Bill Payment',
  'Insurance Payment',
  'Loan Payment',
  'Cash Deposit',
  'Leumi Card',
  'Municipal Tax Payment',
  'Electric Company',
  'Water Corporation',
  'Cellular Payment',
  'Gym Membership',
  'Refund',
];

function signedAmount(magnitude: number, transferType: string): number {
  if (transferType === 'deposit') return magnitude;
  if (transferType === 'withdrawal' || transferType === 'payment')
    return -magnitude;
  return Math.random() < 0.5 ? magnitude : -magnitude; // transfer
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');

  await mongoose.connect(uri);
  const TransactionModel = mongoose.model('Transaction', TransactionSchema);

  console.log('Clearing existing transactions...');
  await TransactionModel.deleteMany({});

  console.log(`Seeding ${TOTAL} transactions...`);

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, TOTAL - i);
    const batch = Array.from({ length: batchSize }, () => {
      const transferType = faker.helpers.arrayElement(TRANSFER_TYPES);
      const magnitude = faker.number.float({
        min: 1,
        max: 5000,
        fractionDigits: 2,
      });
      return {
        transactionId: faker.string.uuid(),
        description: faker.helpers.arrayElement(DESCRIPTIONS),
        amount: signedAmount(magnitude, transferType),
        transferType,
        cardLastFour: faker.string.numeric(4),
      };
    });

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
