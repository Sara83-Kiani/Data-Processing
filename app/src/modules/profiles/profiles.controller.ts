import { Controller, Get } from '@nestjs/common';

@Controller('profiles')
export class ProfilesController {
  @Get()
  test() {
    return 'Profiles module works!';
  }
}
