import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSeriesById, getMinimumAgeForClassificationName, type SeriesDetail, type Episode } from '../services/titles.api';
import { addOrUpdateHistory, getHistory, type HistoryItem } from '../services/history.api';
import { useProfile } from '../context/ProfileContext';
import WatchlistButton from '../components/WatchlistButton';
import ContentWarnings from '../components/ContentWarnings';

export default function SeriesDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodeHistory, setEpisodeHistory] = useState<Map<number, HistoryItem>>(new Map());
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const requiredAge = getMinimumAgeForClassificationName(series?.classification?.name);
  const isAgeRestricted =
    typeof activeProfile?.age === 'number' && activeProfile.age < requiredAge;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSeriesById(Number(id))
      .then((res: any) => {
        const data = res.data || res;
        setSeries(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!activeProfile || !series) {
      setEpisodeHistory(new Map());
      return;
    }
    getHistory(activeProfile.profileId)
      .then((history) => {
        const episodeIds = series.episodes?.map((ep) => ep.episodeId) || [];
        const historyMap = new Map<number, HistoryItem>();
        history.forEach((h) => {
          if (h.episodeId && episodeIds.includes(h.episodeId)) {
            historyMap.set(h.episodeId, h);
          }
        });
        setEpisodeHistory(historyMap);
      })
      .catch(() => setEpisodeHistory(new Map()));
  }, [activeProfile, series]);

  const handleStartEpisode = async (episodeId: number) => {
    if (!activeProfile || isAgeRestricted) return;
    setActionLoading(episodeId);
    try {
      const entry = await addOrUpdateHistory(activeProfile.profileId, {
        episodeId,
        completed: false,
      });
      setEpisodeHistory((prev) => new Map(prev).set(episodeId, entry));
    } catch (err) {
      console.error('Failed to start episode:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinishEpisode = async (episodeId: number) => {
    if (!activeProfile || isAgeRestricted) return;
    setActionLoading(episodeId);
    try {
      const entry = await addOrUpdateHistory(activeProfile.profileId, {
        episodeId,
        completed: true,
      });
      setEpisodeHistory((prev) => new Map(prev).set(episodeId, entry));
    } catch (err) {
      console.error('Failed to finish episode:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#141414', minHeight: '100vh', padding: 24 }}>
        <p style={{ color: '#ccc' }}>Loading...</p>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div style={{ backgroundColor: '#141414', minHeight: '100vh', padding: 24 }}>
        <p style={{ color: '#e50914' }}>Error: {error || 'Series not found'}</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}>
          Back to Home
        </button>
      </div>
    );
  }

  const filteredEpisodes = series.episodes?.filter((ep) => ep.seasonNumber === selectedSeason) || [];
  const seasonNumbers = Array.from({ length: series.seasons }, (_, i) => i + 1);

  const formatEpisodeCode = (ep: Episode) => {
    const s = String(ep.seasonNumber).padStart(2, '0');
    const e = String(ep.episodeNumber).padStart(2, '0');
    return `S${s}E${e}`;
  };

  return (
    <div style={{ backgroundColor: '#141414', minHeight: '100vh', padding: 24 }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'transparent',
          border: '1px solid #666',
          color: '#fff',
          padding: '8px 16px',
          cursor: 'pointer',
          marginBottom: 24,
          borderRadius: 4,
        }}
      >
        ← Back
      </button>

      <div style={{ maxWidth: 800 }}>
        {isAgeRestricted && (
          <div
            style={{
              backgroundColor: '#3a1b1b',
              border: '1px solid #7f1d1d',
              color: '#fecaca',
              padding: '12px 14px',
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            This title is restricted for this profile. Minimum age: {requiredAge}. Current age: {activeProfile?.age}.
          </div>
        )}
        <h1 style={{ color: '#fff', fontSize: 32, marginBottom: 8 }}>{series.title}</h1>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {series.classification && (
            <span style={{ color: '#fff', backgroundColor: '#333', padding: '4px 12px', borderRadius: 4, fontSize: 14 }}>
              {series.classification.name}
            </span>
          )}
          <span style={{ color: '#fff', backgroundColor: '#e50914', padding: '4px 12px', borderRadius: 4, fontSize: 14, fontWeight: 'bold' }}>
            HD
          </span>
          {series.genre && (
            <span style={{ color: '#ccc', fontSize: 14 }}>{series.genre.name}</span>
          )}
          <span style={{ color: '#ccc', fontSize: 14 }}>{series.seasons} Season{series.seasons !== 1 ? 's' : ''}</span>
        </div>

        <p style={{ color: '#ccc', fontSize: 16, lineHeight: 1.6 }}>{series.description}</p>

        <ContentWarnings classification={series.classification?.name} />

        <div style={{ marginTop: 24, marginBottom: 32 }}>
          <WatchlistButton seriesId={series.seriesId} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#fff', marginRight: 12 }}>Season:</label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            style={{
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {seasonNumbers.map((num) => (
              <option key={num} value={num}>Season {num}</option>
            ))}
          </select>
        </div>

        <div>
          <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 16 }}>Episodes</h2>
          {filteredEpisodes.length === 0 ? (
            <p style={{ color: '#666' }}>No episodes available for this season.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredEpisodes.map((ep) => {
                const historyEntry = episodeHistory.get(ep.episodeId);
                const isLoading = actionLoading === ep.episodeId;
                return (
                  <div
                    key={ep.episodeId}
                    style={{
                      backgroundColor: '#222',
                      padding: 16,
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <span style={{ color: '#e50914', fontWeight: 'bold', marginRight: 12 }}>
                        {formatEpisodeCode(ep)}
                      </span>
                      <span style={{ color: '#fff' }}>{ep.title}</span>
                    </div>
                    <span style={{ color: '#666', fontSize: 14 }}>{ep.duration}</span>
                    <div style={{ minWidth: 120, textAlign: 'right' }}>
                      {!historyEntry ? (
                        <button
                          onClick={() => handleStartEpisode(ep.episodeId)}
                          disabled={isLoading || isAgeRestricted}
                          style={{
                            backgroundColor: '#46d369',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 'bold',
                            cursor: isLoading || isAgeRestricted ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                          }}
                        >
                          {isAgeRestricted ? 'Restricted' : isLoading ? '...' : '▶ Start'}
                        </button>
                      ) : !historyEntry.completed ? (
                        <button
                          onClick={() => handleFinishEpisode(ep.episodeId)}
                          disabled={isLoading || isAgeRestricted}
                          style={{
                            backgroundColor: '#2196f3',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 'bold',
                            cursor: isLoading || isAgeRestricted ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                          }}
                        >
                          {isAgeRestricted ? 'Restricted' : isLoading ? '...' : '✓ Finish'}
                        </button>
                      ) : (
                        <span
                          style={{
                            color: '#46d369',
                            fontSize: 12,
                            fontWeight: 'bold',
                          }}
                        >
                          ✓ Watched
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
