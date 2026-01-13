import { Controller, Get, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  test() {
    return 'Accounts module works!';
  }

  /**
   * Get current logged-in user's account info
   * GET /accounts/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyAccount(@Req() req: any) {
    try {
      const accountId = req.user?.sub || req.user?.accountId;
      const account = await this.accountsService.getAccountById(accountId);
      return {
        success: true,
        data: account.toJSON(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
