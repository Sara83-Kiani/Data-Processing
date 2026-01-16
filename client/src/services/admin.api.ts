import { apiFetch } from './api';

export interface Genre {
  genreId: number;
  name: string;
}

export interface Classification {
  classificationId: number;
  name: string;
  description: string;
}

export interface CreateMovieRequest {
  title: string;
  description: string;
  duration?: string;
  genreId: number;
  classificationId: number;
}

export interface CreateSeriesRequest {
  title: string;
  description: string;
  seasons?: number;
  genreId: number;
  classificationId: number;
}

export interface CreateEpisodeRequest {
  seriesId: number;
  title: string;
  duration?: string;
  seasonNumber: number;
  episodeNumber: number;
}

export function getGenres(): Promise<Genre[]> {
  return apiFetch<{ data: Genre[] }>('/content/genres').then((res) => res.data);
}

export function getClassifications(): Promise<Classification[]> {
  return apiFetch<{ data: Classification[] }>('/content/classifications').then(
    (res) => res.data,
  );
}

export function createMovie(data: CreateMovieRequest): Promise<any> {
  return apiFetch<{ data: any }>('/content/movies', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then((res) => res.data);
}

export function createSeries(data: CreateSeriesRequest): Promise<any> {
  return apiFetch<{ data: any }>('/content/series', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then((res) => res.data);
}

export function createEpisode(data: CreateEpisodeRequest): Promise<any> {
  return apiFetch<{ data: any }>('/content/episodes', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then((res) => res.data);
}

export function deleteMovie(id: number): Promise<void> {
  return apiFetch<void>(`/content/movies/${id}`, { method: 'DELETE' });
}

export function deleteSeries(id: number): Promise<void> {
  return apiFetch<void>(`/content/series/${id}`, { method: 'DELETE' });
}

export function deleteEpisode(id: number): Promise<void> {
  return apiFetch<void>(`/content/episodes/${id}`, { method: 'DELETE' });
}
