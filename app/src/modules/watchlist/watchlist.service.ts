import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from './entities/watchlist.entity';
import { AddToWatchlistDto } from './dto/add-to-watchlist.dto';
import { Episode } from '../content/entities/episode.entity';
import { Profile } from '../profiles/entities/profile.entity';

/**
 * Watchlist Service
 * Handles business logic for user watchlists
 */
@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private readonly watchlistRepository: Repository<Watchlist>,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  /**
   * Verify that a profile belongs to the given account
   * @throws NotFoundException if profile doesn't exist
   * @throws ForbiddenException if profile doesn't belong to account
   */
  async verifyProfileOwnership(profileId: number, accountId: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { profileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.accountId !== accountId) {
      throw new ForbiddenException('Profile does not belong to your account');
    }

    return profile;
  }

  /**
   * Get all watchlist items for a profile
   */
  async getWatchlistByProfile(profileId: number): Promise<Watchlist[]> {
    return this.watchlistRepository.find({
      where: { profileId },
      relations: ['movie', 'movie.genre', 'movie.classification', 'series', 'series.genre', 'series.classification'],
      order: { addedAt: 'DESC' },
    });
  }

  /**
   * Add item to watchlist
   */
  async addToWatchlist(profileId: number, dto: AddToWatchlistDto): Promise<Watchlist> {
    // Check if already in watchlist
    const existing = await this.findExisting(profileId, dto);
    if (existing) {
      throw new ConflictException('Item already in watchlist');
    }

    let episodeId = dto.episodeId || null;

    // If adding a series without an episode, auto-select the first episode (S01E01)
    if (dto.seriesId && !dto.movieId && !episodeId) {
      const firstEpisode = await this.episodeRepository.findOne({
        where: { seriesId: dto.seriesId, seasonNumber: 1, episodeNumber: 1 },
      });
      if (!firstEpisode) {
        throw new BadRequestException('Series has no episodes available');
      }
      episodeId = firstEpisode.episodeId;
    }

    const watchlistItem = this.watchlistRepository.create({
      profileId: profileId,
      movieId: dto.movieId || null,
      seriesId: dto.seriesId || null,
      episodeId: episodeId,
    });

    return this.watchlistRepository.save(watchlistItem);
  }

  /**
   * Remove item from watchlist
   */
  async removeFromWatchlist(
    profileId: number,
    movieId?: number,
    seriesId?: number,
  ): Promise<void> {
    const query: any = { profileId };
    
    if (movieId) {
      query.movieId = movieId;
    } else if (seriesId) {
      query.seriesId = seriesId;
    } else {
      throw new NotFoundException('Must specify movieId or seriesId');
    }

    const result = await this.watchlistRepository.delete(query);
    
    if (result.affected === 0) {
      throw new NotFoundException('Item not found in watchlist');
    }
  }

  /**
   * Check if item is in watchlist
   */
  async isInWatchlist(
    profileId: number,
    movieId?: number,
    seriesId?: number,
  ): Promise<boolean> {
    const query: any = { profileId };
    
    if (movieId) {
      query.movieId = movieId;
    } else if (seriesId) {
      query.seriesId = seriesId;
    } else {
      return false;
    }

    const count = await this.watchlistRepository.count({ where: query });
    return count > 0;
  }

  /**
   * Find existing watchlist item
   */
  private async findExisting(profileId: number, dto: AddToWatchlistDto): Promise<Watchlist | null> {
    const query: any = { profileId };
    
    if (dto.movieId) {
      query.movieId = dto.movieId;
    } else if (dto.seriesId) {
      query.seriesId = dto.seriesId;
    }

    return this.watchlistRepository.findOne({ where: query });
  }

  /**
   * Remove item from watchlist by watchlist item ID
   */
  async removeFromWatchlistById(profileId: number, watchlistId: number): Promise<void> {
    const item = await this.watchlistRepository.findOne({
      where: { watchlistId, profileId },
    });

    if (!item) {
      throw new NotFoundException('Watchlist item not found');
    }

    await this.watchlistRepository.delete({ watchlistId });
  }
}
