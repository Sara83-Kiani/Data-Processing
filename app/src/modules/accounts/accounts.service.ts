import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  /**
   * Get account by ID
   */
  async getAccountById(accountId: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { accountId },
      relations: ['profiles'],
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }
}
