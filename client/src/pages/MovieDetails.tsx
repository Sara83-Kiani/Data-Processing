import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, type MovieDetail } from '../services/titles.api';
import WatchlistButton from '../components/WatchlistButton';
import ContentWarnings from '../components/ContentWarnings';

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMovieById(Number(id))
      .then((res: any) => {
        const data = res.data || res;
        setMovie(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#141414', minHeight: '100vh', padding: 24 }}>
        <p style={{ color: '#ccc' }}>Loading...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div style={{ backgroundColor: '#141414', minHeight: '100vh', padding: 24 }}>
        <p style={{ color: '#e50914' }}>Error: {error || 'Movie not found'}</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}>
          Back to Home
        </button>
      </div>
    );
  }

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
        <h1 style={{ color: '#fff', fontSize: 32, marginBottom: 8 }}>{movie.title}</h1>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {movie.classification && (
            <span style={{ color: '#fff', backgroundColor: '#333', padding: '4px 12px', borderRadius: 4, fontSize: 14 }}>
              {movie.classification.name}
            </span>
          )}
          <span style={{ color: '#fff', backgroundColor: '#e50914', padding: '4px 12px', borderRadius: 4, fontSize: 14, fontWeight: 'bold' }}>
            HD
          </span>
          {movie.genre && (
            <span style={{ color: '#ccc', fontSize: 14 }}>{movie.genre.name}</span>
          )}
          {movie.duration && (
            <span style={{ color: '#ccc', fontSize: 14 }}>{movie.duration}</span>
          )}
        </div>

        <p style={{ color: '#ccc', fontSize: 16, lineHeight: 1.6 }}>{movie.description}</p>

        <ContentWarnings classification={movie.classification?.name} />

        <div style={{ marginTop: 24 }}>
          <WatchlistButton movieId={movie.movieId} />
        </div>
      </div>
    </div>
  );
}
