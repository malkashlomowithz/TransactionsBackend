import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from './schemas/transaction.schema';
import { FindTransactionsQueryDto } from './dto/find-transactions-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

export interface PaginatedTransactions {
  items: TransactionDocument[];
  nextCursor: string | null;
  hasMore: boolean;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async findPaginated({
    cursor,
    limit,
  }: FindTransactionsQueryDto): Promise<PaginatedTransactions> {
    const filter = cursor ? { _id: { $gt: new Types.ObjectId(cursor) } } : {};

    const items = await this.transactionModel
      .find(filter)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .exec();

    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? String(page[page.length - 1]._id) : null;

    return { items: page, nextCursor, hasMore };
  }

  async findOne(id: string): Promise<TransactionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid transaction id');
    }

    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid transaction id');
    }

    const transaction = await this.transactionModel
      .findByIdAndUpdate(id, updateTransactionDto, { new: true })
      .exec();

    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    return transaction;
  }
}
