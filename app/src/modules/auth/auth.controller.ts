import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get()
  test() {
    return 'Auth module works!';
  }
}
