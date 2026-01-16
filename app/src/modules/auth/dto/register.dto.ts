import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  // Must be a valid email format
  @IsEmail()
  email: string;

  //password rules for now.
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;
}
