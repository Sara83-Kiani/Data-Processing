import { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import {
  addToWatchlist,
  removeFromWatchlist,
  checkInWatchlist,
} from '../services/watchlist.api';

interface WatchlistButtonProps {
  movieId?: number;
  seriesId?: number;
  episodeId?: number;
}

export default function WatchlistButton({
  movieId,
  seriesId,
  episodeId,
}: WatchlistButtonProps) {
  const { activeProfile } = useProfile();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeProfile) return;

    checkInWatchlist(activeProfile.profileId, movieId, seriesId)
      .then(setInWatchlist)
      .catch(() => setInWatchlist(false));
  }, [activeProfile, movieId, seriesId]);

  const handleClick = async () => {
    if (!activeProfile) {
      alert('Please select a profile first');
      return;
    }

    setLoading(true);
    try {
      if (inWatchlist) {
        await removeFromWatchlist(activeProfile.profileId, movieId, seriesId);
        setInWatchlist(false);
      } else {
        await addToWatchlist(activeProfile.profileId, {
          movieId,
          seriesId,
          episodeId,
        });
        setInWatchlist(true);
      }
    } catch (err: any) {
      console.error('Watchlist operation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || !activeProfile}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        backgroundColor: inWatchlist ? '#333' : 'transparent',
        color: '#fff',
        border: '1px solid #fff',
        padding: '10px 20px',
        borderRadius: 4,
        cursor: loading || !activeProfile ? 'not-allowed' : 'pointer',
        fontSize: 14,
        fontWeight: 500,
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s ease',
      }}
      title={!activeProfile ? 'Select a profile to add to watchlist' : ''}
    >
      <span style={{ fontSize: 18 }}>{inWatchlist ? '✓' : '+'}</span>
      {loading ? 'Loading...' : inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
    </button>
  );
}
