import { useEffect, useState } from 'react';
import {
  getGenres,
  getClassifications,
  createMovie,
  createSeries,
  createEpisode,
  type Genre,
  type Classification,
} from '../services/admin.api';
import { getSeries } from '../services/titles.api';

type TabType = 'movie' | 'series' | 'episode';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>('movie');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Movie form
  const [movieTitle, setMovieTitle] = useState('');
  const [movieDescription, setMovieDescription] = useState('');
  const [movieDuration, setMovieDuration] = useState('01:30:00');
  const [movieGenreId, setMovieGenreId] = useState<number>(0);
  const [movieClassificationId, setMovieClassificationId] = useState<number>(0);

  // Series form
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesDescription, setSeriesDescription] = useState('');
  const [seriesSeasons, setSeriesSeasons] = useState(1);
  const [seriesGenreId, setSeriesGenreId] = useState<number>(0);
  const [seriesClassificationId, setSeriesClassificationId] = useState<number>(0);

  // Episode form
  const [episodeSeriesId, setEpisodeSeriesId] = useState<number>(0);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeDuration, setEpisodeDuration] = useState('00:45:00');
  const [episodeSeasonNumber, setEpisodeSeasonNumber] = useState(1);
  const [episodeNumber, setEpisodeNumber] = useState(1);

  useEffect(() => {
    Promise.all([
      getGenres(),
      getClassifications(),
      getSeries().then((res: any) => res.data || res),
    ])
      .then(([g, c, s]) => {
        setGenres(g);
        setClassifications(c);
        setSeriesList(s);
        if (g.length > 0) {
          setMovieGenreId(g[0].genreId);
          setSeriesGenreId(g[0].genreId);
        }
        if (c.length > 0) {
          setMovieClassificationId(c[0].classificationId);
          setSeriesClassificationId(c[0].classificationId);
        }
        if (s.length > 0) {
          setEpisodeSeriesId(s[0].seriesId);
        }
      })
      .catch((err) => console.error('Error loading data:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await createMovie({
        title: movieTitle,
        description: movieDescription,
        duration: movieDuration,
        genreId: movieGenreId,
        classificationId: movieClassificationId,
      });
      setMessage({ type: 'success', text: `Movie "${movieTitle}" created successfully!` });
      setMovieTitle('');
      setMovieDescription('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create movie' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const newSeries = await createSeries({
        title: seriesTitle,
        description: seriesDescription,
        seasons: seriesSeasons,
        genreId: seriesGenreId,
        classificationId: seriesClassificationId,
      });
      setMessage({ type: 'success', text: `Series "${seriesTitle}" created successfully!` });
      setSeriesTitle('');
      setSeriesDescription('');
      setSeriesList((prev) => [...prev, newSeries]);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create series' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await createEpisode({
        seriesId: episodeSeriesId,
        title: episodeTitle,
        duration: episodeDuration,
        seasonNumber: episodeSeasonNumber,
        episodeNumber: episodeNumber,
      });
      setMessage({ type: 'success', text: `Episode "${episodeTitle}" created successfully!` });
      setEpisodeTitle('');
      setEpisodeNumber((prev) => prev + 1);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create episode' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#333',
    border: '1px solid #555',
    borderRadius: 4,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#ccc',
    fontSize: 14,
    marginBottom: 6,
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#e50914',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: 4,
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    backgroundColor: isActive ? '#e50914' : '#333',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: isActive ? 'bold' : 'normal',
  });

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
      <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Admin - Add Content
      </h1>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: 24,
            borderRadius: 4,
            backgroundColor: message.type === 'success' ? '#1e4620' : '#4a1515',
            color: message.type === 'success' ? '#4ade80' : '#f87171',
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: 24, display: 'flex', gap: 0 }}>
        <button style={tabStyle(activeTab === 'movie')} onClick={() => setActiveTab('movie')}>
          Add Movie
        </button>
        <button style={tabStyle(activeTab === 'series')} onClick={() => setActiveTab('series')}>
          Add Series
        </button>
        <button style={tabStyle(activeTab === 'episode')} onClick={() => setActiveTab('episode')}>
          Add Episode
        </button>
      </div>

      <div
        style={{
          maxWidth: 500,
          backgroundColor: '#222',
          padding: 24,
          borderRadius: 8,
        }}
      >
        {activeTab === 'movie' && (
          <form onSubmit={handleCreateMovie}>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              value={movieTitle}
              onChange={(e) => setMovieTitle(e.target.value)}
              style={inputStyle}
              required
            />

            <label style={labelStyle}>Description</label>
            <textarea
              value={movieDescription}
              onChange={(e) => setMovieDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              required
            />

            <label style={labelStyle}>Duration (HH:MM:SS)</label>
            <input
              type="text"
              value={movieDuration}
              onChange={(e) => setMovieDuration(e.target.value)}
              style={inputStyle}
              placeholder="01:30:00"
            />

            <label style={labelStyle}>Genre</label>
            <select
              value={movieGenreId}
              onChange={(e) => setMovieGenreId(Number(e.target.value))}
              style={inputStyle}
            >
              {genres.map((g) => (
                <option key={g.genreId} value={g.genreId}>
                  {g.name}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Classification</label>
            <select
              value={movieClassificationId}
              onChange={(e) => setMovieClassificationId(Number(e.target.value))}
              style={inputStyle}
            >
              {classifications.map((c) => (
                <option key={c.classificationId} value={c.classificationId}>
                  {c.name}
                </option>
              ))}
            </select>

            <button type="submit" style={buttonStyle} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Movie'}
            </button>
          </form>
        )}

        {activeTab === 'series' && (
          <form onSubmit={handleCreateSeries}>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              value={seriesTitle}
              onChange={(e) => setSeriesTitle(e.target.value)}
              style={inputStyle}
              required
            />

            <label style={labelStyle}>Description</label>
            <textarea
              value={seriesDescription}
              onChange={(e) => setSeriesDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              required
            />

            <label style={labelStyle}>Number of Seasons</label>
            <input
              type="number"
              value={seriesSeasons}
              onChange={(e) => setSeriesSeasons(Number(e.target.value))}
              style={inputStyle}
              min={1}
            />

            <label style={labelStyle}>Genre</label>
            <select
              value={seriesGenreId}
              onChange={(e) => setSeriesGenreId(Number(e.target.value))}
              style={inputStyle}
            >
              {genres.map((g) => (
                <option key={g.genreId} value={g.genreId}>
                  {g.name}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Classification</label>
            <select
              value={seriesClassificationId}
              onChange={(e) => setSeriesClassificationId(Number(e.target.value))}
              style={inputStyle}
            >
              {classifications.map((c) => (
                <option key={c.classificationId} value={c.classificationId}>
                  {c.name}
                </option>
              ))}
            </select>

            <button type="submit" style={buttonStyle} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Series'}
            </button>
          </form>
        )}

        {activeTab === 'episode' && (
          <form onSubmit={handleCreateEpisode}>
            <label style={labelStyle}>Series</label>
            <select
              value={episodeSeriesId}
              onChange={(e) => setEpisodeSeriesId(Number(e.target.value))}
              style={inputStyle}
            >
              {seriesList.map((s) => (
                <option key={s.seriesId} value={s.seriesId}>
                  {s.title}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Episode Title</label>
            <input
              type="text"
              value={episodeTitle}
              onChange={(e) => setEpisodeTitle(e.target.value)}
              style={inputStyle}
              required
            />

            <label style={labelStyle}>Duration (HH:MM:SS)</label>
            <input
              type="text"
              value={episodeDuration}
              onChange={(e) => setEpisodeDuration(e.target.value)}
              style={inputStyle}
              placeholder="00:45:00"
            />

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Season</label>
                <input
                  type="number"
                  value={episodeSeasonNumber}
                  onChange={(e) => setEpisodeSeasonNumber(Number(e.target.value))}
                  style={inputStyle}
                  min={1}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Episode #</label>
                <input
                  type="number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                  style={inputStyle}
                  min={1}
                />
              </div>
            </div>

            <button type="submit" style={buttonStyle} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Episode'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
