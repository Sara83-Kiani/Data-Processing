import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { Account } from '../accounts/entities/accounts.entity';
import { ActivationToken } from './activation-token.entity';
import { PasswordReset } from './entities/password-reset.entity';

function getJwtExpiresIn(): SignOptions['expiresIn'] {
  const raw = process.env.JWT_EXPIRES_IN ?? '3600'; // default: 1 hour in seconds

  // If it's all digits, treat it as seconds
  if (/^\d+$/.test(raw)) return Number(raw);

  // Otherwise treat it as a duration string (e.g. '1h', '7d', '15m')
  return raw as SignOptions['expiresIn'];
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, ActivationToken, PasswordReset]),

    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev_secret_change_me',
      signOptions: {
        expiresIn: getJwtExpiresIn(),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
