import { IsOptional, IsInt } from 'class-validator';

export class AddToWatchlistDto {
  @IsOptional()
  @IsInt()
  movieId?: number;

  @IsOptional()
  @IsInt()
  seriesId?: number;

  @IsOptional()
  @IsInt()
  episodeId?: number;
}
