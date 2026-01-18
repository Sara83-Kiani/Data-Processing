import { apiFetch } from './api';

export interface Title {
  id: number;
  title: string;
  type: string;
  release_year?: number;
  genre?: string;
  description?: string;
}

export interface MovieDetail {
  movieId: number;
  title: string;
  description: string;
  duration: string;
  genre: { genreId: number; name: string } | null;
  classification: { classificationId: number; name: string; minAge: number } | null;
}

export interface Episode {
  episodeId: number;
  title: string;
  duration: string;
  seasonNumber: number;
  episodeNumber: number;
}

export interface SeriesDetail {
  seriesId: number;
  title: string;
  description: string;
  seasons: number;
  genre: { genreId: number; name: string } | null;
  classification: { classificationId: number; name: string; minAge: number } | null;
  episodes: Episode[];
}

export function getMovies(): Promise<Title[]> {
  return apiFetch<Title[]>('/content/movies');
}

export function getSeries(): Promise<Title[]> {
  return apiFetch<Title[]>('/content/series');
}

export function getMovieById(id: number): Promise<MovieDetail> {
  return apiFetch<MovieDetail>(`/content/movies/${id}`);
}

export function getSeriesById(id: number): Promise<SeriesDetail> {
  return apiFetch<SeriesDetail>(`/content/series/${id}`);
}

export function getEpisodesBySeries(seriesId: number, season?: number): Promise<Episode[]> {
  const query = season ? `?season=${season}` : '';
  return apiFetch<Episode[]>(`/content/series/${seriesId}/episodes${query}`);
}
