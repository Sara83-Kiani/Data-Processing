import { useEffect, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { getHistory, removeFromHistory, clearHistory, type HistoryItem } from '../services/history.api';
import TitleCard from '../components/TitleCard';
import EmptyState from '../components/EmptyState';

export default function History() {
  const { activeProfile } = useProfile();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeProfile) {
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getHistory(activeProfile.profileId)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [activeProfile]);

  const handleRemove = async (historyId: number) => {
    if (!activeProfile) return;
    try {
      await removeFromHistory(activeProfile.profileId, historyId);
      setHistory((prev) => prev.filter((item) => item.historyId !== historyId));
    } catch (err) {
      console.error('Failed to remove history item:', err);
    }
  };

  const handleClearAll = async () => {
    if (!activeProfile) return;
    if (!window.confirm('Are you sure you want to clear all watch history?')) return;
    try {
      await clearHistory(activeProfile.profileId);
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: '#141414',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#ccc', fontSize: 18 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#141414', minHeight: '100vh', padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>Watch History</h1>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #666',
              color: '#ccc',
              padding: '8px 16px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon="📜"
          title="No items yet"
          description="Start watching movies and series to build your history"
          actionLabel="Browse Content"
          actionPath="/"
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 24,
          }}
        >
          {history.map((item) => {
            const isMovie = !!item.movie;
            const content = isMovie ? item.movie : item.episode?.series;
            if (!content) return null;

            return (
              <div key={item.historyId} style={{ position: 'relative' }}>
                <TitleCard
                  id={isMovie ? item.movie!.movieId : item.episode!.series!.seriesId}
                  title={
                    isMovie
                      ? content.title
                      : `${item.episode?.series?.title} - S${item.episode?.seasonNumber}E${item.episode?.episodeNumber}`
                  }
                  type={isMovie ? 'movie' : 'series'}
                  classification={content.classification?.name}
                  progress={item.completed ? undefined : item.resumePosition}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 4,
                  }}
                >
                  <span style={{ color: '#666', fontSize: 12 }}>
                    {new Date(item.lastWatchedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleRemove(item.historyId)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: '4px 8px',
                    }}
                  >
                    Remove
                  </button>
                </div>
                {item.completed && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: '#46d369',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: 2,
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}
                  >
                    Watched
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
