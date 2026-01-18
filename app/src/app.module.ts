import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ContentModule } from './modules/content/content.module';
import { InvitationsModule } from './modules/invitations/invitations.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'mysql', // docker service name
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? 'qwerty',
      database: process.env.DB_NAME ?? 'mydb',
      autoLoadEntities: true,
      synchronize: false,
    }),
    AuthModule,
    AccountsModule,
    ProfilesModule,
    ContentModule,
    InvitationsModule,
  ],
})
export class AppModule {}
