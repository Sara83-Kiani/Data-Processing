import { useNavigate } from 'react-router-dom';
import { getMinimumAgeForClassificationName } from '../services/titles.api';

export interface TitleCardProps {
  id: number;
  title: string;
  posterUrl?: string;
  type: 'movie' | 'series';
  classification?: string;
  quality?: string;
  progress?: string;
  viewerAge?: number;
}

export default function TitleCard({
  id,
  title,
  posterUrl,
  type,
  classification,
  quality,
  progress,
  viewerAge,
}: TitleCardProps) {
  const navigate = useNavigate();

  const requiredAge = getMinimumAgeForClassificationName(classification);
  const isAgeRestricted = typeof viewerAge === 'number' && viewerAge < requiredAge;

  const handleClick = () => {
    if (isAgeRestricted) {
      window.alert(
        `This title is restricted (${classification ?? 'Unrated'}). Minimum age: ${requiredAge}.`,
      );
      return;
    }
    const path = type === 'movie' ? `/movies/${id}` : `/series/${id}`;
    navigate(path);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: 240,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div
        style={{
          width: 240,
          height: 135,
          backgroundColor: '#333',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {isAgeRestricted && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12,
              zIndex: 2,
            }}
          >
            <div style={{ color: '#fff', textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 6 }}>Restricted</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Minimum age: {requiredAge}</div>
            </div>
          </div>
        )}
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#aaa',
              fontSize: 14,
              textAlign: 'center',
              padding: 12,
              background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
            }}
          >
            {title}
          </div>
        )}
        {classification && (
          <span
            style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: 2,
              fontSize: 10,
            }}
          >
            {classification}
          </span>
        )}
        {quality && (
          <span
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: '#e50914',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: 2,
              fontSize: 10,
              fontWeight: 'bold',
            }}
          >
            {quality}
          </span>
        )}
        {progress && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: 'rgba(255,255,255,0.3)',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: '#e50914',
                width: '40%',
              }}
            />
          </div>
        )}
      </div>
      <p
        style={{
          marginTop: 6,
          fontSize: 13,
          color: '#e5e5e5',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </p>
    </div>
  );
}
