import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { Account } from '../accounts/entities/accounts.entity';
import { ActivationToken } from './activation-token.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

function getJwtExpiresIn(): SignOptions['expiresIn'] {
  const raw = process.env.JWT_EXPIRES_IN ?? '3600';
  if (/^\d+$/.test(raw)) return Number(raw);
  return raw as SignOptions['expiresIn'];
}

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, ActivationToken, PasswordReset, Invitation]),
    JwtModule.register({
      secret: requireEnv('JWT_SECRET'), // ✅ always env
      signOptions: { expiresIn: getJwtExpiresIn() },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
