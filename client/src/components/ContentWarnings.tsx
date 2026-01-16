interface ContentWarningsProps {
  classification?: string;
}

const warningsByClassification: Record<string, string[]> = {
  'R': ['Violence', 'Adult Content', 'Strong Language'],
  'TV-MA': ['Violence', 'Adult Content', 'Strong Language'],
  'PG-13': ['Some Violence', 'Mild Language'],
  'TV-14': ['Some Violence', 'Suggestive Content'],
  'PG': ['Mild Themes'],
  'TV-PG': ['Mild Themes'],
  'G': [],
};

export default function ContentWarnings({ classification }: ContentWarningsProps) {
  if (!classification) return null;

  const warnings = warningsByClassification[classification] || [];
  
  if (warnings.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>Content Warnings:</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {warnings.map((warning) => (
          <span
            key={warning}
            style={{
              backgroundColor: '#3a3a3a',
              color: '#ccc',
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            {warning}
          </span>
        ))}
      </div>
    </div>
  );
}
