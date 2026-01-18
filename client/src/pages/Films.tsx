import { useEffect, useState } from 'react';
import { getMovies } from '../services/titles.api';
import TitleCard from '../components/TitleCard';

interface Movie {
  movieId: number;
  title: string;
  description: string;
  classification?: { name: string };
}

export default function Films() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMovies()
      .then((res: any) => setMovies(res.data || res))
      .catch((err) => console.error('Error fetching movies:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#141414', minHeight: '100vh', padding: 24 }}>
        <p style={{ color: '#ccc' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#141414', minHeight: '100vh', padding: 24 }}>
      <h1 style={{ color: '#fff', fontSize: 28, marginBottom: 24 }}>Films</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 20,
        }}
      >
        {movies.map((movie) => (
          <TitleCard
            key={movie.movieId}
            id={movie.movieId}
            title={movie.title}
            type="movie"
            classification={movie.classification?.name}
            quality="HD"
          />
        ))}
      </div>
    </div>
  );
}
