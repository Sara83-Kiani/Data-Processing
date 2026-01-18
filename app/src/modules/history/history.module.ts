import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { WatchHistory } from './entities/watch-history.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WatchHistory, Profile]),
    forwardRef(() => AuthModule),
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
