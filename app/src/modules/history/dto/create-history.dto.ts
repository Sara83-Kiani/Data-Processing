import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateHistoryDto {
  @IsNumber()
  @IsOptional()
  movieId?: number;

  @IsNumber()
  @IsOptional()
  episodeId?: number;

  @IsNumber()
  @IsOptional()
  durationWatched?: number;

  @IsString()
  @IsOptional()
  resumePosition?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
