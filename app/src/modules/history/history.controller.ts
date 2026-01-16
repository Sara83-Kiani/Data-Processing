import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';

@Controller('profiles/:profileId/history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  getHistory(
    @Req() req: any,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : undefined;
    return this.historyService.getHistory(
      Number(req.user.sub),
      profileId,
      limitNum,
    );
  }

  @Get('continue-watching')
  getContinueWatching(
    @Req() req: any,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.historyService.getContinueWatching(
      Number(req.user.sub),
      profileId,
      limitNum,
    );
  }

  @Post()
  addOrUpdateHistory(
    @Req() req: any,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() dto: CreateHistoryDto,
  ) {
    return this.historyService.addOrUpdateHistory(
      Number(req.user.sub),
      profileId,
      dto,
    );
  }

  @Patch(':historyId')
  updateHistory(
    @Req() req: any,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Param('historyId', ParseIntPipe) historyId: number,
    @Body() dto: UpdateHistoryDto,
  ) {
    return this.historyService.updateHistory(
      Number(req.user.sub),
      profileId,
      historyId,
      dto,
    );
  }

  @Delete(':historyId')
  removeHistory(
    @Req() req: any,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Param('historyId', ParseIntPipe) historyId: number,
  ) {
    return this.historyService.removeHistory(
      Number(req.user.sub),
      profileId,
      historyId,
    );
  }

  @Delete()
  clearHistory(
    @Req() req: any,
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    return this.historyService.clearHistory(Number(req.user.sub), profileId);
  }
}
