import { useEffect, useState } from 'react';
import { getMovies, getSeries } from '../services/titles.api';
import { getWatchlist, type WatchlistItem } from '../services/watchlist.api';
import { useProfile } from '../context/ProfileContext';
import TitleCard from '../components/TitleCard';

interface Movie {
  movieId: number;
  title: string;
  description: string;
  classification?: { name: string };
  quality?: string;
}

interface Series {
  seriesId: number;
  title: string;
  description: string;
  classification?: { name: string };
  quality?: string;
}

interface ContentRowProps {
  title: string;
  children: React.ReactNode;
}

function ContentRow({ title, children }: ContentRowProps) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          color: '#fff',
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 16,
          paddingLeft: 4,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 16,
          scrollbarWidth: 'thin',
          scrollbarColor: '#555 transparent',
        }}
      >
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  const { activeProfile } = useProfile();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMovies().then((res: any) => res.data || res),
      getSeries().then((res: any) => res.data || res),
    ])
      .then(([moviesData, seriesData]) => {
        setMovies(moviesData.slice(0, 12));
        setSeries(seriesData.slice(0, 12));
      })
      .catch((err) => console.error('Error fetching content:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeProfile) {
      setWatchlist([]);
      return;
    }
    getWatchlist(activeProfile.profileId)
      .then(setWatchlist)
      .catch(() => setWatchlist([]));
  }, [activeProfile]);

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
    <div style={{ backgroundColor: '#141414', minHeight: '100vh' }}>
      <div
        style={{
          background: 'linear-gradient(to bottom, #1a1a2e 0%, #141414 100%)',
          padding: '48px 24px 24px',
        }}
      >
        <h1
          style={{
            color: '#fff',
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Welcome to Streamflix
        </h1>
        <p style={{ color: '#999', fontSize: 14 }}>
          Discover movies and series tailored for you
        </p>
      </div>

      <div style={{ padding: '24px' }}>
        {watchlist.length > 0 && (
          <ContentRow title="My List">
            {watchlist.map((item) => {
              const isMovie = !!item.movie;
              const content = isMovie ? item.movie : item.series;
              if (!content) return null;
              return (
                <TitleCard
                  key={item.watchlistId}
                  id={isMovie ? item.movie!.movieId : item.series!.seriesId}
                  title={content.title}
                  type={isMovie ? 'movie' : 'series'}
                  classification={content.classification?.name}
                />
              );
            })}
          </ContentRow>
        )}

        <ContentRow title="Popular Movies">
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
        </ContentRow>

        <ContentRow title="Trending Series">
          {series.map((s) => (
            <TitleCard
              key={s.seriesId}
              id={s.seriesId}
              title={s.title}
              type="series"
              classification={s.classification?.name}
              quality="HD"
            />
          ))}
        </ContentRow>
      </div>
    </div>
  );
}
