import { IsEnum, IsOptional, IsString } from 'class-validator';

export class SubscribeDto {
  @IsEnum(['SD', 'HD', 'UHD'])
  quality: 'SD' | 'HD' | 'UHD';

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
