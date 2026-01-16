import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WatchlistService } from './watchlist.service';
import { AddToWatchlistDto } from './dto/add-to-watchlist.dto';

@Controller('profiles/:profileId/watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  getWatchlist(
    @Req() req: any,
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    return this.watchlistService.getWatchlist(Number(req.user.sub), profileId);
  }

  @Post()
  addToWatchlist(
    @Req() req: any,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() dto: AddToWatchlistDto,
  ) {
    return this.watchlistService.addToWatchlist(
      Number(req.user.sub),
      profileId,
      dto,
    );
  }

  @Delete(':itemId')
  removeFromWatchlistById(
    @Req() req: any,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.watchlistService.removeFromWatchlistById(
      Number(req.user.sub),
      profileId,
      itemId,
    );
  }

  @Delete()
  removeFromWatchlistByContent(
    @Req() req: any,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Query('movieId') movieId?: string,
    @Query('seriesId') seriesId?: string,
  ) {
    return this.watchlistService.removeFromWatchlistByContent(
      Number(req.user.sub),
      profileId,
      movieId ? parseInt(movieId) : undefined,
      seriesId ? parseInt(seriesId) : undefined,
    );
  }

  @Get('check')
  checkInWatchlist(
    @Req() req: any,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Query('movieId') movieId?: string,
    @Query('seriesId') seriesId?: string,
  ) {
    return this.watchlistService.checkInWatchlist(
      Number(req.user.sub),
      profileId,
      movieId ? parseInt(movieId) : undefined,
      seriesId ? parseInt(seriesId) : undefined,
    );
  }
}
