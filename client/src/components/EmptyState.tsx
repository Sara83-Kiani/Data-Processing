import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  actionPath,
  onAction,
}: EmptyStateProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onAction) {
      onAction();
    } else if (actionPath) {
      navigate(actionPath);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 48, marginBottom: 16 }}>{icon}</span>
      <p
        style={{
          color: '#999',
          fontSize: 18,
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        {title}
      </p>
      {description && (
        <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
          {description}
        </p>
      )}
      {actionLabel && (actionPath || onAction) && (
        <button
          onClick={handleClick}
          style={{
            backgroundColor: '#e50914',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f40612')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#e50914')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
