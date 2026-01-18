import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchHistory } from './entities/watch-history.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(WatchHistory)
    private readonly historyRepo: Repository<WatchHistory>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {}

  private async mustOwnProfile(accountId: number, profileId: number) {
    const profile = await this.profileRepo.findOne({ where: { profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.accountId !== accountId) throw new ForbiddenException('Not allowed');
    return profile;
  }

  async getHistory(accountId: number, profileId: number, limit?: number) {
    await this.mustOwnProfile(accountId, profileId);

    const query = this.historyRepo
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.movie', 'movie')
      .leftJoinAndSelect('movie.genre', 'movieGenre')
      .leftJoinAndSelect('movie.classification', 'movieClassification')
      .leftJoinAndSelect('history.episode', 'episode')
      .leftJoinAndSelect('episode.series', 'series')
      .leftJoinAndSelect('series.genre', 'seriesGenre')
      .leftJoinAndSelect('series.classification', 'seriesClassification')
      .where('history.profile_id = :profileId', { profileId })
      .orderBy('history.last_watched_at', 'DESC');

    if (limit) {
      query.take(limit);
    }

    return query.getMany();
  }

  async getContinueWatching(accountId: number, profileId: number, limit = 10) {
    await this.mustOwnProfile(accountId, profileId);

    return this.historyRepo
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.movie', 'movie')
      .leftJoinAndSelect('movie.genre', 'movieGenre')
      .leftJoinAndSelect('movie.classification', 'movieClassification')
      .leftJoinAndSelect('history.episode', 'episode')
      .leftJoinAndSelect('episode.series', 'series')
      .leftJoinAndSelect('series.genre', 'seriesGenre')
      .leftJoinAndSelect('series.classification', 'seriesClassification')
      .where('history.profile_id = :profileId', { profileId })
      .andWhere('history.completed = false')
      .orderBy('history.last_watched_at', 'DESC')
      .take(limit)
      .getMany();
  }

  async addOrUpdateHistory(
    accountId: number,
    profileId: number,
    dto: CreateHistoryDto,
  ) {
    await this.mustOwnProfile(accountId, profileId);

    if (!dto.movieId && !dto.episodeId) {
      throw new Error('Either movieId or episodeId must be provided');
    }

    // Check if history entry already exists
    const existing = await this.historyRepo.findOne({
      where: {
        profileId,
        ...(dto.movieId ? { movieId: dto.movieId } : {}),
        ...(dto.episodeId ? { episodeId: dto.episodeId } : {}),
      },
    });

    if (existing) {
      // Update existing entry
      Object.assign(existing, {
        durationWatched: dto.durationWatched ?? existing.durationWatched,
        resumePosition: dto.resumePosition ?? existing.resumePosition,
        completed: dto.completed ?? existing.completed,
      });
      return this.historyRepo.save(existing);
    }

    // Create new entry
    const history = this.historyRepo.create({
      profileId,
      movieId: dto.movieId ?? null,
      episodeId: dto.episodeId ?? null,
      durationWatched: dto.durationWatched ?? 1,
      resumePosition: dto.resumePosition ?? '00:00:00',
      completed: dto.completed ?? false,
    });

    return this.historyRepo.save(history);
  }

  async updateHistory(
    accountId: number,
    profileId: number,
    historyId: number,
    dto: UpdateHistoryDto,
  ) {
    await this.mustOwnProfile(accountId, profileId);

    const history = await this.historyRepo.findOne({
      where: { historyId, profileId },
    });

    if (!history) {
      throw new NotFoundException('History entry not found');
    }

    Object.assign(history, dto);
    return this.historyRepo.save(history);
  }

  async removeHistory(accountId: number, profileId: number, historyId: number) {
    await this.mustOwnProfile(accountId, profileId);

    const history = await this.historyRepo.findOne({
      where: { historyId, profileId },
    });

    if (!history) {
      throw new NotFoundException('History entry not found');
    }

    await this.historyRepo.delete({ historyId });
    return { message: 'History entry deleted' };
  }

  async clearHistory(accountId: number, profileId: number) {
    await this.mustOwnProfile(accountId, profileId);
    await this.historyRepo.delete({ profileId });
    return { message: 'History cleared' };
  }
}
