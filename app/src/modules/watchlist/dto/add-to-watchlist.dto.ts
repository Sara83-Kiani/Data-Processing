import { IsInt, IsOptional, ValidateIf, Min } from 'class-validator';

export class AddToWatchlistDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  movieId?: number;

  @ValidateIf((o) => !o.movieId)
  @IsInt()
  @Min(1)
  seriesId?: number;

  @ValidateIf((o) => !o.movieId)
  @IsOptional()
  @IsInt()
  @Min(1)
  episodeId?: number;
}
