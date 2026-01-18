import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ContentModule } from './modules/content/content.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { MailModule } from './modules/mail/mail.module';
import { HistoryModule } from './modules/history/history.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'mysql',
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? 'qwerty',
      database: process.env.DB_NAME ?? 'mydb',
      autoLoadEntities: true,
      synchronize: false,
      timezone: 'local',
    }),
    MailModule,
    AuthModule,
    AccountsModule,
    ProfilesModule,
    ContentModule,
    InvitationsModule,
    SubscriptionsModule,
    HistoryModule,
    WatchlistModule,
  ],
})
export class AppModule {}
