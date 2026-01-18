import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSeriesDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  seasons?: number;

  @IsNumber()
  genreId: number;

  @IsNumber()
  classificationId: number;
}
