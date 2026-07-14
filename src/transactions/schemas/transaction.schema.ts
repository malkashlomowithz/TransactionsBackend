import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

export const TRANSFER_TYPES = [
  'deposit',
  'withdrawal',
  'transfer',
  'payment',
] as const;
export type TransferType = (typeof TRANSFER_TYPES)[number];

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, unique: true })
  transactionId: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: TRANSFER_TYPES })
  transferType: TransferType;

  @Prop({ required: true, match: /^\d{4}$/ })
  cardLastFour: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
