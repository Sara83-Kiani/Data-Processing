import { ArrayMinSize, IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PrefItem {
  @IsInt()
  genreId: number;

  @IsInt()
  classificationId: number;
}

export class SetPreferencesDto {
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => PrefItem)
  items: PrefItem[];
}
