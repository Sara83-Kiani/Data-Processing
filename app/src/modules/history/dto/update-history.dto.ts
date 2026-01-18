import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateHistoryDto {
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
