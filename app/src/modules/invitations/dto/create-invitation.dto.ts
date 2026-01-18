import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  @IsNotEmpty()
  inviteeEmail: string;
}
