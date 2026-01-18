import { apiFetch } from './api';

export interface Title {
  id: number;
  title: string;
  type: string;
  release_year?: number;
  genre?: string;
  description?: string;
}

export function getMinimumAgeForClassificationName(name?: string | null): number {
  const ageMap: Record<string, number> = {
    G: 0,
    PG: 8,
    'PG-13': 13,
    R: 17,
    'NC-17': 18,
    'TV-Y': 0,
    'TV-Y7': 7,
    'TV-G': 0,
    'TV-PG': 8,
    'TV-14': 14,
    'TV-MA': 18,
  };

  if (!name) return 0;
  return ageMap[name] ?? 0;
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

export function getMovies(minAge?: number): Promise<Title[]> {
  const query = typeof minAge === 'number' ? `?minAge=${encodeURIComponent(String(minAge))}` : '';
  return apiFetch<Title[]>(`/content/movies${query}`);
}

export function getSeries(minAge?: number): Promise<Title[]> {
  const query = typeof minAge === 'number' ? `?minAge=${encodeURIComponent(String(minAge))}` : '';
  return apiFetch<Title[]>(`/content/series${query}`);
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
