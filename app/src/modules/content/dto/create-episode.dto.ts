import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateEpisodeDto {
  @IsNumber()
  seriesId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsNumber()
  seasonNumber: number;

  @IsNumber()
  episodeNumber: number;
}
