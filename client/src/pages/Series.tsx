import { useEffect, useState } from 'react';
import { getSeries } from '../services/titles.api';
import TitleCard from '../components/TitleCard';

interface SeriesItem {
  seriesId: number;
  title: string;
  description: string;
  classification?: { name: string };
}

export default function Series() {
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSeries()
      .then((res: any) => setSeries(res.data || res))
      .catch((err) => console.error('Error fetching series:', err))
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
      <h1 style={{ color: '#fff', fontSize: 28, marginBottom: 24 }}>Series</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 20,
        }}
      >
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
      </div>
    </div>
  );
}
