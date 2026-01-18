import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { Series } from './entities/series.entity';
import { Episode } from './entities/episode.entity';
import { Genre } from './entities/genre.entity';
import { Classification } from './entities/classification.entity';

/**
 * Content Service
 * Handles business logic for movies, series, and episodes
 */
@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(Classification)
    private readonly classificationRepository: Repository<Classification>,
  ) {}

  /**
   * Get all movies with optional age filtering
   */
  async getAllMovies(minAge?: number): Promise<Movie[]> {
    const movies = await this.movieRepository.find({
      relations: ['genre', 'classification'],
    });

    if (minAge !== undefined) {
      return movies.filter((movie) => movie.isAppropriateForAge(minAge));
    }

    return movies;
  }

  /**
   * Get movie by ID
   */
  async getMovieById(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: { movieId: id },
      relations: ['genre', 'classification'],
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    return movie;
  }

  /**
   * Get all series with optional age filtering
   */
  async getAllSeries(minAge?: number): Promise<Series[]> {
    const series = await this.seriesRepository.find({
      relations: ['genre', 'classification'],
    });

    if (minAge !== undefined) {
      return series.filter((s) => s.isAppropriateForAge(minAge));
    }

    return series;
  }

  /**
   * Get series by ID with episodes
   */
  async getSeriesById(id: number): Promise<Series> {
    const series = await this.seriesRepository.findOne({
      where: { seriesId: id },
      relations: ['genre', 'classification', 'episodes'],
    });

    if (!series) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }

    return series;
  }

  /**
   * Get episodes for a series
   */
  async getEpisodesBySeriesId(seriesId: number, seasonNumber?: number): Promise<Episode[]> {
    const query: any = { seriesId };
    
    if (seasonNumber) {
      query.seasonNumber = seasonNumber;
    }

    return this.episodeRepository.find({
      where: query,
      order: {
        seasonNumber: 'ASC',
        episodeNumber: 'ASC',
      },
    });
  }

  /**
   * Get episode by ID
   */
  async getEpisodeById(id: number): Promise<Episode> {
    const episode = await this.episodeRepository.findOne({
      where: { episodeId: id },
      relations: ['series'],
    });

    if (!episode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return episode;
  }

  /**
   * Get all genres
   */
  async getAllGenres(): Promise<Genre[]> {
    return this.genreRepository.find();
  }

  /**
   * Get all classifications
   */
  async getAllClassifications(): Promise<Classification[]> {
    return this.classificationRepository.find();
  }

  /**
   * Search movies by title
   */
  async searchMovies(query: string, minAge?: number): Promise<Movie[]> {
    const movies = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genre', 'genre')
      .leftJoinAndSelect('movie.classification', 'classification')
      .where('movie.title LIKE :query', { query: `%${query}%` })
      .getMany();

    if (minAge !== undefined) {
      return movies.filter((movie) => movie.isAppropriateForAge(minAge));
    }

    return movies;
  }

  /**
   * Search series by title
   */
  async searchSeries(query: string, minAge?: number): Promise<Series[]> {
    const series = await this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.genre', 'genre')
      .leftJoinAndSelect('series.classification', 'classification')
      .where('series.title LIKE :query', { query: `%${query}%` })
      .getMany();

    if (minAge !== undefined) {
      return series.filter((s) => s.isAppropriateForAge(minAge));
    }

    return series;
  }

  /**
   * Create a new movie
   */
  async createMovie(data: {
    title: string;
    description: string;
    duration?: string;
    genreId: number;
    classificationId: number;
  }): Promise<Movie> {
    const movie = this.movieRepository.create({
      title: data.title,
      description: data.description,
      duration: data.duration || '01:30:00',
      genreId: data.genreId,
      classificationId: data.classificationId,
    });
    return this.movieRepository.save(movie);
  }

  /**
   * Create a new series
   */
  async createSeries(data: {
    title: string;
    description: string;
    seasons?: number;
    genreId: number;
    classificationId: number;
  }): Promise<Series> {
    const series = this.seriesRepository.create({
      title: data.title,
      description: data.description,
      seasons: data.seasons || 1,
      genreId: data.genreId,
      classificationId: data.classificationId,
    });
    return this.seriesRepository.save(series);
  }

  /**
   * Create a new episode
   */
  async createEpisode(data: {
    seriesId: number;
    title: string;
    duration?: string;
    seasonNumber: number;
    episodeNumber: number;
  }): Promise<Episode> {
    const series = await this.seriesRepository.findOne({
      where: { seriesId: data.seriesId },
    });
    if (!series) {
      throw new NotFoundException(`Series with ID ${data.seriesId} not found`);
    }

    const episode = this.episodeRepository.create({
      seriesId: data.seriesId,
      title: data.title,
      duration: data.duration || '00:45:00',
      seasonNumber: data.seasonNumber,
      episodeNumber: data.episodeNumber,
    });
    return this.episodeRepository.save(episode);
  }

  /**
   * Delete a movie
   */
  async deleteMovie(id: number): Promise<void> {
    const movie = await this.movieRepository.findOne({ where: { movieId: id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    await this.movieRepository.delete({ movieId: id });
  }

  /**
   * Delete a series
   */
  async deleteSeries(id: number): Promise<void> {
    const series = await this.seriesRepository.findOne({ where: { seriesId: id } });
    if (!series) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }
    await this.seriesRepository.delete({ seriesId: id });
  }

  /**
   * Delete an episode
   */
  async deleteEpisode(id: number): Promise<void> {
    const episode = await this.episodeRepository.findOne({ where: { episodeId: id } });
    if (!episode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }
    await this.episodeRepository.delete({ episodeId: id });
  }
}
