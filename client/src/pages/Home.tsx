import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovies, getSeries } from '../services/titles.api';
import { getWatchlist, type WatchlistItem } from '../services/watchlist.api';
import { getContinueWatching, type HistoryItem } from '../services/history.api';
import { useProfile } from '../context/ProfileContext';
import TitleCard from '../components/TitleCard';
import EmptyState from '../components/EmptyState';

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
  emptyState?: React.ReactNode;
}

function ContentRow({ title, children, emptyState }: ContentRowProps) {
  const hasChildren = React.Children.count(children) > 0;
  
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
      {hasChildren ? (
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
      ) : (
        emptyState
      )}
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<HistoryItem[]>([]);
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
      setContinueWatching([]);
      return;
    }
    getWatchlist(activeProfile.profileId)
      .then(setWatchlist)
      .catch(() => setWatchlist([]));
    getContinueWatching(activeProfile.profileId, 10)
      .then(setContinueWatching)
      .catch(() => setContinueWatching([]));
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
        {continueWatching.length > 0 && (
          <ContentRow title="Continue Watching">
            {continueWatching.map((item) => {
              const isMovie = !!item.movie;
              const content = isMovie ? item.movie : item.episode?.series;
              if (!content) return null;
              return (
                <TitleCard
                  key={item.historyId}
                  id={isMovie ? item.movie!.movieId : item.episode!.series!.seriesId}
                  title={isMovie ? content.title : `${item.episode?.series?.title} - S${item.episode?.seasonNumber}E${item.episode?.episodeNumber}`}
                  type={isMovie ? 'movie' : 'series'}
                  classification={content.classification?.name}
                  progress={item.resumePosition}
                  viewerAge={activeProfile?.age}
                />
              );
            })}
          </ContentRow>
        )}

        {activeProfile && (
          <ContentRow
            title="My List"
            emptyState={
              <EmptyState
                icon="📺"
                title="No items yet"
                description="Add movies and series to your list to see them here"
                actionLabel="Browse Content"
                onAction={() => navigate('/films')}
              />
            }
          >
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
                  viewerAge={activeProfile?.age}
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
              viewerAge={activeProfile?.age}
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
              viewerAge={activeProfile?.age}
            />
          ))}
        </ContentRow>
      </div>
    </div>
  );
}
