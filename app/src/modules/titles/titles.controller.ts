import { Controller, Get } from '@nestjs/common';

@Controller('titles')
export class TitlesController {
  @Get()
  test() {
    return 'Titles module works!';
  }
}
