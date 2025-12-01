import { Controller, Get } from '@nestjs/common';

@Controller('invitations')
export class InvitationsController {
  @Get()
  test() {
    return 'Invitations module works!';
  }
}
