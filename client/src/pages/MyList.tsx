import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { getWatchlist, removeFromWatchlist, type WatchlistItem } from '../services/watchlist.api';
import TitleCard from '../components/TitleCard';

export default function MyList() {
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (!activeProfile) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getWatchlist(activeProfile.profileId)
      .then(setWatchlist)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeProfile]);

  const handleRemove = async (item: WatchlistItem) => {
    if (!activeProfile) return;
    
    try {
      await removeFromWatchlist(
        activeProfile.profileId,
        item.movieId,
        item.seriesId,
      );
      setWatchlist((prev) => prev.filter((w) => w.watchlistId !== item.watchlistId));
    } catch (err: any) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  if (!activeProfile) {
    return (
      <div style={{ backgroundColor: '#141414', minHeight: '100vh', padding: 24 }}>
        <h1 style={{ color: '#fff', fontSize: 28, marginBottom: 16 }}>My List</h1>
        <p style={{ color: '#999' }}>Please select a profile to view your watchlist.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#141414', minHeight: '100vh', padding: 24 }}>
        <p style={{ color: '#ccc' }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#141414', minHeight: '100vh', padding: 24 }}>
        <p style={{ color: '#e50914' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#141414', minHeight: '100vh', padding: 24 }}>
      <h1 style={{ color: '#fff', fontSize: 28, marginBottom: 24 }}>My List</h1>

      {watchlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ color: '#999', fontSize: 18, marginBottom: 16 }}>
            Your watchlist is empty
          </p>
          <p style={{ color: '#666', marginBottom: 24 }}>
            Browse movies and series to add them to your list
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#e50914',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            Browse Content
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {watchlist.map((item) => {
            const isMovie = !!item.movie;
            const content = isMovie ? item.movie : item.series;
            
            if (!content) return null;

            return (
              <div key={item.watchlistId} style={{ position: 'relative' }}>
                <TitleCard
                  id={isMovie ? item.movie!.movieId : item.series!.seriesId}
                  title={content.title}
                  type={isMovie ? 'movie' : 'series'}
                  classification={content.classification?.name}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item);
                  }}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                  }}
                  title="Remove from list"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
