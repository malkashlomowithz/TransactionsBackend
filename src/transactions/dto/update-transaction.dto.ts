import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { TRANSFER_TYPES } from '../schemas/transaction.schema';
import type { TransferType } from '../schemas/transaction.schema';

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsIn(TRANSFER_TYPES)
  transferType?: TransferType;

  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'cardLastFour must be exactly 4 digits' })
  cardLastFour?: string;
}
