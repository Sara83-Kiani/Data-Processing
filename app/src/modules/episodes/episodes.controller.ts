import { Controller, Get } from '@nestjs/common';

@Controller('episodes')
export class EpisodesController {
  @Get()
  test() {
    return 'Episodes module works!';
  }
}
