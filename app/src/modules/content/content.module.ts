import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { Movie } from './entities/movie.entity';
import { Series } from './entities/series.entity';
import { Episode } from './entities/episode.entity';
import { Genre } from './entities/genre.entity';
import { Classification } from './entities/classification.entity';
import { Subtitle } from './entities/subtitle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      Series,
      Episode,
      Genre,
      Classification,
      Subtitle,
    ]),
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
