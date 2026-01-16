import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/accounts.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepo: Repository<Account>,
  ) {}

  findByEmail(email: string) {
    return this.accountsRepo.findOne({ where: { email } });
  }

  async getAccountById(accountId: number): Promise<Account> {
    const account = await this.accountsRepo.findOne({
      where: { accountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }
}
