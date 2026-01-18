import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { Watchlist } from './entities/watchlist.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Watchlist, Profile]),
    forwardRef(() => AuthModule),
  ],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}
