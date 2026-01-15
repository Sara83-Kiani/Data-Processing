import { Controller, Get, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyAccount(@Req() req: any) {
    const accountId = req.user?.sub || req.user?.accountId;
    const account = await this.accountsService.getAccountById(Number(accountId));
    return { success: true, data: account };
  }
}
