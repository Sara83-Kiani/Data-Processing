import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('ContentController', () => {
  let controller: ContentController;
  let service: ContentService;

  const mockContentService = {
    getAllMovies: jest.fn(),
    getMovieById: jest.fn(),
    searchMovies: jest.fn(),
    getAllSeries: jest.fn(),
    getSeriesById: jest.fn(),
    getEpisodesBySeriesId: jest.fn(),
    getAllGenres: jest.fn(),
    getAllClassifications: jest.fn(),
    createMovie: jest.fn(),
    createSeries: jest.fn(),
    createEpisode: jest.fn(),
    deleteMovie: jest.fn(),
    deleteSeries: jest.fn(),
    deleteEpisode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ContentController>(ContentController);
    service = module.get<ContentService>(ContentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllMovies', () => {
    it('should return movies without minAge filter', async () => {
      const movies = [{ movie_id: 1, title: 'Test Movie' }];
      mockContentService.getAllMovies.mockResolvedValue(movies);

      const result = await controller.getAllMovies();

      expect(service.getAllMovies).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({
        success: true,
        data: movies,
        count: movies.length,
      });
    });

    it('should return movies with minAge filter', async () => {
      const movies = [{ movie_id: 1, title: 'Test Movie' }];
      mockContentService.getAllMovies.mockResolvedValue(movies);

      const result = await controller.getAllMovies('13');

      expect(service.getAllMovies).toHaveBeenCalledWith(13);
      expect(result).toEqual({
        success: true,
        data: movies,
        count: movies.length,
      });
    });

    it('should throw BadRequestException for invalid minAge', async () => {
      await expect(controller.getAllMovies('abc')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getMovieById', () => {
    it('should return movie by ID', async () => {
      const movie = { movie_id: 1, title: 'Test Movie' };
      mockContentService.getMovieById.mockResolvedValue(movie);

      const result = await controller.getMovieById(1);

      expect(service.getMovieById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        data: movie,
      });
    });

    it('should propagate NotFoundException from service', async () => {
      mockContentService.getMovieById.mockRejectedValue(
        new NotFoundException('Movie not found'),
      );

      await expect(controller.getMovieById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchMovies', () => {
    it('should return search results', async () => {
      const movies = [{ movie_id: 1, title: 'Action Movie' }];
      mockContentService.searchMovies.mockResolvedValue(movies);

      const result = await controller.searchMovies('action', '13');

      expect(service.searchMovies).toHaveBeenCalledWith('action', 13);
      expect(result).toEqual({
        success: true,
        data: movies,
        count: movies.length,
      });
    });

    it('should throw BadRequestException for invalid minAge', async () => {
      await expect(controller.searchMovies('action', 'abc')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllSeries', () => {
    it('should return series without minAge filter', async () => {
      const series = [{ series_id: 1, title: 'Test Series' }];
      mockContentService.getAllSeries.mockResolvedValue(series);

      const result = await controller.getAllSeries();

      expect(service.getAllSeries).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({
        success: true,
        data: series,
        count: series.length,
      });
    });

    it('should throw BadRequestException for invalid minAge', async () => {
      await expect(controller.getAllSeries('abc')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getSeriesById', () => {
    it('should return series by ID', async () => {
      const series = { series_id: 1, title: 'Test Series' };
      mockContentService.getSeriesById.mockResolvedValue(series);

      const result = await controller.getSeriesById(1);

      expect(service.getSeriesById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        data: series,
      });
    });

    it('should propagate NotFoundException from service', async () => {
      mockContentService.getSeriesById.mockRejectedValue(
        new NotFoundException('Series not found'),
      );

      await expect(controller.getSeriesById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getEpisodes', () => {
    it('should return episodes for series', async () => {
      const episodes = [{ episode_id: 1, title: 'Episode 1' }];
      mockContentService.getEpisodesBySeriesId.mockResolvedValue(episodes);

      const result = await controller.getEpisodes(1, '1');

      expect(service.getEpisodesBySeriesId).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({
        success: true,
        data: episodes,
        count: episodes.length,
      });
    });

    it('should throw BadRequestException for invalid season', async () => {
      await expect(controller.getEpisodes(1, 'abc')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllGenres', () => {
    it('should return all genres', async () => {
      const genres = [{ genre_id: 1, name: 'Action' }];
      mockContentService.getAllGenres.mockResolvedValue(genres);

      const result = await controller.getAllGenres();

      expect(service.getAllGenres).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: genres,
      });
    });
  });

  describe('getAllClassifications', () => {
    it('should return all classifications', async () => {
      const classifications = [{ classification_id: 1, name: 'PG-13' }];
      mockContentService.getAllClassifications.mockResolvedValue(classifications);

      const result = await controller.getAllClassifications();

      expect(service.getAllClassifications).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: classifications,
      });
    });
  });
});
