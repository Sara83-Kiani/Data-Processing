import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { TitlesModule } from './modules/titles/titles.module';
import { InvitationsModule } from './modules/invitations/invitations.module';

@Module({
  imports: [
    AuthModule,
    AccountsModule,
    ProfilesModule,
    TitlesModule,
    InvitationsModule,
  ],
})
export class AppModule {}
