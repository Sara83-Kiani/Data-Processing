import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { Watchlist } from './entities/watchlist.entity';
import { Episode } from '../content/entities/episode.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Watchlist, Episode, Profile]),
    AuthModule,
  ],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}
