import { Controller, Get, Post, Delete, Param, Query, Body, ParseIntPipe, UseGuards, BadRequestException } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMovieDto } from './dto/create-movie.dto';
import { CreateSeriesDto } from './dto/create-series.dto';
import { CreateEpisodeDto } from './dto/create-episode.dto';

/**
 * Content Controller
 * Handles HTTP requests for browsing movies, series, and episodes
 */
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /**
   * Get all movies
   * GET /content/movies?minAge=13
   */
  @Get('movies')
  async getAllMovies(@Query('minAge') minAge?: string) {
    const age = minAge ? parseInt(minAge, 10) : undefined;
    if (minAge && Number.isNaN(age)) {
      throw new BadRequestException('minAge must be a number');
    }

    const movies = await this.contentService.getAllMovies(age);
    return {
      success: true,
      data: movies,
      count: movies.length,
    };
  }

  /**
   * Get movie by ID
   * GET /content/movies/:id
   */
  @Get('movies/:id')
  async getMovieById(@Param('id', ParseIntPipe) id: number) {
    const movie = await this.contentService.getMovieById(id);
    return {
      success: true,
      data: movie,
    };
  }

  /**
   * Search movies
   * GET /content/movies/search?q=action&minAge=13
   */
  @Get('movies/search')
  async searchMovies(
    @Query('q') query: string,
    @Query('minAge') minAge?: string,
  ) {
    if (!query || !String(query).trim()) {
      throw new BadRequestException('q is required');
    }

    const age = minAge ? parseInt(minAge, 10) : undefined;
    if (minAge && Number.isNaN(age)) {
      throw new BadRequestException('minAge must be a number');
    }

    const movies = await this.contentService.searchMovies(query, age);
    return {
      success: true,
      data: movies,
      count: movies.length,
    };
  }

  /**
   * Get all series
   * GET /content/series?minAge=13
   */
  @Get('series')
  async getAllSeries(@Query('minAge') minAge?: string) {
    const age = minAge ? parseInt(minAge, 10) : undefined;
    if (minAge && Number.isNaN(age)) {
      throw new BadRequestException('minAge must be a number');
    }

    const series = await this.contentService.getAllSeries(age);
    return {
      success: true,
      data: series,
      count: series.length,
    };
  }

  /**
   * Get series by ID with episodes
   * GET /content/series/:id
   */
  @Get('series/:id')
  async getSeriesById(@Param('id', ParseIntPipe) id: number) {
    const series = await this.contentService.getSeriesById(id);
    return {
      success: true,
      data: series,
    };
  }

  /**
   * Get episodes for a series
   * GET /content/series/:id/episodes?season=1
   */
  @Get('series/:id/episodes')
  async getEpisodes(
    @Param('id', ParseIntPipe) seriesId: number,
    @Query('season') season?: string,
  ) {
    const seasonNumber = season ? parseInt(season, 10) : undefined;
    if (season && Number.isNaN(seasonNumber)) {
      throw new BadRequestException('season must be a number');
    }

    const episodes = await this.contentService.getEpisodesBySeriesId(seriesId, seasonNumber);
    return {
      success: true,
      data: episodes,
      count: episodes.length,
    };
  }

  /**
   * Get all genres
   * GET /content/genres
   */
  @Get('genres')
  async getAllGenres() {
    const genres = await this.contentService.getAllGenres();
    return {
      success: true,
      data: genres,
    };
  }

  /**
   * Get all classifications
   * GET /content/classifications
   */
  @Get('classifications')
  async getAllClassifications() {
    const classifications = await this.contentService.getAllClassifications();
    return {
      success: true,
      data: classifications,
    };
  }

  /**
   * Create a new movie
   * POST /content/movies
   */
  @Post('movies')
  @UseGuards(JwtAuthGuard)
  async createMovie(@Body() dto: CreateMovieDto) {
    const movie = await this.contentService.createMovie(dto);
    return {
      success: true,
      data: movie,
    };
  }

  /**
   * Create a new series
   * POST /content/series
   */
  @Post('series')
  @UseGuards(JwtAuthGuard)
  async createSeries(@Body() dto: CreateSeriesDto) {
    const series = await this.contentService.createSeries(dto);
    return {
      success: true,
      data: series,
    };
  }

  /**
   * Create a new episode
   * POST /content/episodes
   */
  @Post('episodes')
  @UseGuards(JwtAuthGuard)
  async createEpisode(@Body() dto: CreateEpisodeDto) {
    const episode = await this.contentService.createEpisode(dto);
    return {
      success: true,
      data: episode,
    };
  }

  /**
   * Delete a movie
   * DELETE /content/movies/:id
   */
  @Delete('movies/:id')
  @UseGuards(JwtAuthGuard)
  async deleteMovie(@Param('id', ParseIntPipe) id: number) {
    await this.contentService.deleteMovie(id);
    return {
      success: true,
      message: 'Movie deleted',
    };
  }

  /**
   * Delete a series
   * DELETE /content/series/:id
   */
  @Delete('series/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSeries(@Param('id', ParseIntPipe) id: number) {
    await this.contentService.deleteSeries(id);
    return {
      success: true,
      message: 'Series deleted',
    };
  }

  /**
   * Delete an episode
   * DELETE /content/episodes/:id
   */
  @Delete('episodes/:id')
  @UseGuards(JwtAuthGuard)
  async deleteEpisode(@Param('id', ParseIntPipe) id: number) {
    await this.contentService.deleteEpisode(id);
    return {
      success: true,
      message: 'Episode deleted',
    };
  }
}
