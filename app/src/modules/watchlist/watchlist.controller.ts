import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { AddToWatchlistDto } from './dto/add-to-watchlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Watchlist Controller
 * Handles HTTP requests for watchlist operations
 * Routes: /profiles/:profileId/watchlist
 * All routes require JWT authentication and verify profile ownership
 */
@Controller('profiles/:profileId/watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  /**
   * Get account ID from JWT token
   */
  private getAccountId(req: any): number {
    return req.user?.sub || req.user?.accountId;
  }

  /**
   * Get watchlist for a profile
   * GET /profiles/:profileId/watchlist
   * Returns: 200 OK with watchlist items
   * Errors: 401 Unauthorized, 403 Forbidden, 404 Profile not found
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getWatchlist(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Req() req: any,
  ) {
    const accountId = this.getAccountId(req);
    await this.watchlistService.verifyProfileOwnership(profileId, accountId);
    
    const items = await this.watchlistService.getWatchlistByProfile(profileId);
    return {
      success: true,
      data: items,
      count: items.length,
    };
  }

  /**
   * Add item to watchlist
   * POST /profiles/:profileId/watchlist
   * Body: { movieId?: number, seriesId?: number, episodeId?: number }
   * Returns: 201 Created with new watchlist item
   * Errors: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict (duplicate)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addToWatchlist(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() dto: AddToWatchlistDto,
    @Req() req: any,
  ) {
    const accountId = this.getAccountId(req);
    await this.watchlistService.verifyProfileOwnership(profileId, accountId);
    
    const item = await this.watchlistService.addToWatchlist(profileId, dto);
    return {
      success: true,
      data: item,
      message: 'Added to watchlist',
    };
  }

  /**
   * Remove item from watchlist by watchlist item ID
   * DELETE /profiles/:profileId/watchlist/:itemId
   * Returns: 204 No Content
   * Errors: 401 Unauthorized, 403 Forbidden, 404 Not Found
   */
  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromWatchlistById(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() req: any,
  ) {
    const accountId = this.getAccountId(req);
    await this.watchlistService.verifyProfileOwnership(profileId, accountId);
    
    await this.watchlistService.removeFromWatchlistById(profileId, itemId);
  }

  /**
   * Remove item from watchlist by movie/series ID (alternative endpoint)
   * DELETE /profiles/:profileId/watchlist?movieId=1 or ?seriesId=1
   * Returns: 204 No Content
   * Errors: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromWatchlist(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Query('movieId') movieId?: string,
    @Query('seriesId') seriesId?: string,
    @Req() req?: any,
  ) {
    const accountId = this.getAccountId(req);
    await this.watchlistService.verifyProfileOwnership(profileId, accountId);
    
    await this.watchlistService.removeFromWatchlist(
      profileId,
      movieId ? parseInt(movieId) : undefined,
      seriesId ? parseInt(seriesId) : undefined,
    );
  }

  /**
   * Check if item is in watchlist
   * GET /profiles/:profileId/watchlist/check?movieId=1 or ?seriesId=1
   * Returns: 200 OK with { inWatchlist: boolean }
   * Errors: 401 Unauthorized, 403 Forbidden, 404 Profile not found
   */
  @Get('check')
  @HttpCode(HttpStatus.OK)
  async checkInWatchlist(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Query('movieId') movieId?: string,
    @Query('seriesId') seriesId?: string,
    @Req() req?: any,
  ) {
    const accountId = this.getAccountId(req);
    await this.watchlistService.verifyProfileOwnership(profileId, accountId);
    
    const inWatchlist = await this.watchlistService.isInWatchlist(
      profileId,
      movieId ? parseInt(movieId) : undefined,
      seriesId ? parseInt(seriesId) : undefined,
    );
    return {
      success: true,
      inWatchlist,
    };
  }
}
