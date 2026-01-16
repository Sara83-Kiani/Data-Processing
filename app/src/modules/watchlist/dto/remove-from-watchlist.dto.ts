import { IsInt, IsOptional } from 'class-validator';

export class RemoveFromWatchlistDto {
  @IsInt()
  profileId: number;

  @IsOptional()
  @IsInt()
  movieId?: number;

  @IsOptional()
  @IsInt()
  seriesId?: number;
}
