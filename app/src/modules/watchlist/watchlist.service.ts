import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from './entities/watchlist.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { AddToWatchlistDto } from './dto/add-to-watchlist.dto';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private readonly watchlistRepo: Repository<Watchlist>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}

  private async mustOwnProfile(accountId: number, profileId: number) {
    const profile = await this.profileRepo.findOne({ where: { profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.accountId !== accountId) throw new ForbiddenException('Not allowed');
    return profile;
  }

  async getWatchlist(accountId: number, profileId: number) {
    await this.mustOwnProfile(accountId, profileId);

    const items = await this.watchlistRepo
      .createQueryBuilder('watchlist')
      .leftJoinAndSelect('watchlist.movie', 'movie')
      .leftJoinAndSelect('movie.genre', 'movieGenre')
      .leftJoinAndSelect('movie.classification', 'movieClassification')
      .leftJoinAndSelect('watchlist.series', 'series')
      .leftJoinAndSelect('series.genre', 'seriesGenre')
      .leftJoinAndSelect('series.classification', 'seriesClassification')
      .leftJoinAndSelect('watchlist.episode', 'episode')
      .where('watchlist.profile_id = :profileId', { profileId })
      .orderBy('watchlist.added_at', 'DESC')
      .getMany();

    return { data: items };
  }

  async addToWatchlist(
    accountId: number,
    profileId: number,
    dto: AddToWatchlistDto,
  ) {
    await this.mustOwnProfile(accountId, profileId);

    // Validate: must have movieId OR (seriesId AND episodeId)
    if (!dto.movieId && (!dto.seriesId || !dto.episodeId)) {
      throw new BadRequestException(
        'Must provide movieId or both seriesId and episodeId',
      );
    }

    // Check if already in watchlist
    const existing = await this.watchlistRepo.findOne({
      where: {
        profileId,
        ...(dto.movieId ? { movieId: dto.movieId } : {}),
        ...(dto.seriesId ? { seriesId: dto.seriesId } : {}),
      },
    });

    if (existing) {
      throw new BadRequestException('Item already in watchlist');
    }

    const item = this.watchlistRepo.create({
      profileId,
      movieId: dto.movieId ?? null,
      seriesId: dto.seriesId ?? null,
      episodeId: dto.episodeId ?? null,
    });

    const saved = await this.watchlistRepo.save(item);
    return { data: saved };
  }

  async removeFromWatchlistById(
    accountId: number,
    profileId: number,
    itemId: number,
  ) {
    await this.mustOwnProfile(accountId, profileId);

    const item = await this.watchlistRepo.findOne({
      where: { watchlistId: itemId, profileId },
    });

    if (!item) {
      throw new NotFoundException('Watchlist item not found');
    }

    await this.watchlistRepo.delete({ watchlistId: itemId });
    return { message: 'Removed from watchlist' };
  }

  async removeFromWatchlistByContent(
    accountId: number,
    profileId: number,
    movieId?: number,
    seriesId?: number,
  ) {
    await this.mustOwnProfile(accountId, profileId);

    if (!movieId && !seriesId) {
      throw new BadRequestException('Must provide movieId or seriesId');
    }

    const item = await this.watchlistRepo.findOne({
      where: {
        profileId,
        ...(movieId ? { movieId } : {}),
        ...(seriesId ? { seriesId } : {}),
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found in watchlist');
    }

    await this.watchlistRepo.delete({ watchlistId: item.watchlistId });
    return { message: 'Removed from watchlist' };
  }

  async checkInWatchlist(
    accountId: number,
    profileId: number,
    movieId?: number,
    seriesId?: number,
  ) {
    await this.mustOwnProfile(accountId, profileId);

    if (!movieId && !seriesId) {
      return { inWatchlist: false };
    }

    const item = await this.watchlistRepo.findOne({
      where: {
        profileId,
        ...(movieId ? { movieId } : {}),
        ...(seriesId ? { seriesId } : {}),
      },
    });

    return { inWatchlist: !!item };
  }
}
