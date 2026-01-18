import { apiFetch } from './api';

export interface WatchlistItem {
  watchlistId: number;
  profileId: number;
  movieId?: number;
  seriesId?: number;
  episodeId?: number;
  addedAt: string;
  movie?: {
    movieId: number;
    title: string;
    description: string;
    duration: string;
    genre?: { genreId: number; name: string };
    classification?: { classificationId: number; name: string };
  };
  series?: {
    seriesId: number;
    title: string;
    description: string;
    seasons: number;
    genre?: { genreId: number; name: string };
    classification?: { classificationId: number; name: string };
  };
}

export interface AddToWatchlistRequest {
  movieId?: number;
  seriesId?: number;
  episodeId?: number;
}

/**
 * Get all watchlist items for a profile
 * GET /profiles/:profileId/watchlist
 */
export function getWatchlist(profileId: number): Promise<WatchlistItem[]> {
  return apiFetch<{ data: WatchlistItem[] }>(`/profiles/${profileId}/watchlist`).then(
    (res) => res.data,
  );
}

/**
 * Add item to watchlist
 * POST /profiles/:profileId/watchlist
 */
export function addToWatchlist(
  profileId: number,
  request: AddToWatchlistRequest,
): Promise<WatchlistItem> {
  return apiFetch<{ data: WatchlistItem }>(`/profiles/${profileId}/watchlist`, {
    method: 'POST',
    body: JSON.stringify(request),
  }).then((res) => res.data);
}

/**
 * Remove item from watchlist by watchlist item ID
 * DELETE /profiles/:profileId/watchlist/:itemId
 */
export function removeFromWatchlistById(
  profileId: number,
  itemId: number,
): Promise<void> {
  return apiFetch<void>(`/profiles/${profileId}/watchlist/${itemId}`, {
    method: 'DELETE',
  });
}

/**
 * Remove item from watchlist by movie/series ID
 * DELETE /profiles/:profileId/watchlist?movieId=X or ?seriesId=X
 */
export function removeFromWatchlist(
  profileId: number,
  movieId?: number,
  seriesId?: number,
): Promise<void> {
  const params = new URLSearchParams();
  if (movieId) params.append('movieId', String(movieId));
  if (seriesId) params.append('seriesId', String(seriesId));
  
  return apiFetch<void>(`/profiles/${profileId}/watchlist?${params.toString()}`, {
    method: 'DELETE',
  });
}

/**
 * Check if item is in watchlist
 * GET /profiles/:profileId/watchlist/check?movieId=X or ?seriesId=X
 */
export function checkInWatchlist(
  profileId: number,
  movieId?: number,
  seriesId?: number,
): Promise<boolean> {
  const params = new URLSearchParams();
  if (movieId) params.append('movieId', String(movieId));
  if (seriesId) params.append('seriesId', String(seriesId));
  
  return apiFetch<{ inWatchlist: boolean }>(
    `/profiles/${profileId}/watchlist/check?${params.toString()}`,
  ).then((res) => res.inWatchlist);
}
