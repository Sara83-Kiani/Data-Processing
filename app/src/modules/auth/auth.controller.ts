import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /auth/login
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // GET /auth/activate?token=...
  // Called when user clicks verification link in email.
  @Get('activate')
  async activate(@Query('token') token: string, @Res() res: Response) {
    await this.authService.activateAccount(token);

    // Redirect to frontend login page with query param that triggers popup
    return res.redirect(this.authService.getActivatedRedirectUrl());
  }
}
