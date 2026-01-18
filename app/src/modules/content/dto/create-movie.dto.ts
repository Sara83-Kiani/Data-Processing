import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsNumber()
  genreId: number;

  @IsNumber()
  classificationId: number;
}
