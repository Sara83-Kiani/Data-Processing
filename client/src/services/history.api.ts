import { apiFetch } from './api';

export interface HistoryItem {
  historyId: number;
  profileId: number;
  movieId?: number;
  episodeId?: number;
  durationWatched: number;
  resumePosition: string;
  completed: boolean;
  startedAt: string;
  lastWatchedAt: string;
  movie?: {
    movieId: number;
    title: string;
    description: string;
    duration: string;
    genre?: { genreId: number; name: string };
    classification?: { classificationId: number; name: string };
  };
  episode?: {
    episodeId: number;
    title: string;
    duration: string;
    seasonNumber: number;
    episodeNumber: number;
    series?: {
      seriesId: number;
      title: string;
      description: string;
      seasons: number;
      genre?: { genreId: number; name: string };
      classification?: { classificationId: number; name: string };
    };
  };
}

export interface AddHistoryRequest {
  movieId?: number;
  episodeId?: number;
  durationWatched?: number;
  resumePosition?: string;
  completed?: boolean;
}

export interface UpdateHistoryRequest {
  durationWatched?: number;
  resumePosition?: string;
  completed?: boolean;
}

/**
 * Get all watch history for a profile
 * GET /profiles/:profileId/history
 */
export function getHistory(profileId: number, limit?: number): Promise<HistoryItem[]> {
  const params = limit ? `?limit=${limit}` : '';
  return apiFetch<HistoryItem[]>(`/profiles/${profileId}/history${params}`);
}

/**
 * Get continue watching items (incomplete history)
 * GET /profiles/:profileId/history/continue-watching
 */
export function getContinueWatching(profileId: number, limit = 10): Promise<HistoryItem[]> {
  return apiFetch<HistoryItem[]>(
    `/profiles/${profileId}/history/continue-watching?limit=${limit}`,
  );
}

/**
 * Add or update history entry
 * POST /profiles/:profileId/history
 */
export function addOrUpdateHistory(
  profileId: number,
  request: AddHistoryRequest,
): Promise<HistoryItem> {
  return apiFetch<HistoryItem>(`/profiles/${profileId}/history`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Update history entry
 * PATCH /profiles/:profileId/history/:historyId
 */
export function updateHistory(
  profileId: number,
  historyId: number,
  request: UpdateHistoryRequest,
): Promise<HistoryItem> {
  return apiFetch<HistoryItem>(`/profiles/${profileId}/history/${historyId}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

/**
 * Remove history entry
 * DELETE /profiles/:profileId/history/:historyId
 */
export function removeFromHistory(
  profileId: number,
  historyId: number,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/profiles/${profileId}/history/${historyId}`, {
    method: 'DELETE',
  });
}

/**
 * Clear all history for a profile
 * DELETE /profiles/:profileId/history
 */
export function clearHistory(profileId: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/profiles/${profileId}/history`, {
    method: 'DELETE',
  });
}
