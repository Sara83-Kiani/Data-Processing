import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { activeProfile, setActiveProfile } = useProfile();

  const linkStyle = {
    color: '#ccc',
    textDecoration: 'none',
    padding: '8px 16px',
    fontSize: 14,
  };

  const profiles = [
    { profileId: 1, name: 'Adult', image: '', age: 18, color: '#e50914' },
    { profileId: 2, name: 'Kids', image: '', age: 10, color: '#46d369' },
  ];

  const currentProfile = activeProfile || profiles[0];
  const currentColor = profiles.find(p => p.profileId === currentProfile.profileId)?.color || '#e50914';

  return (
    <nav
      style={{
        backgroundColor: '#111',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ ...linkStyle, color: '#e50914', fontWeight: 'bold', fontSize: 20 }}>
          Streamflix
        </Link>
        <div style={{ marginLeft: 32, display: 'flex', gap: 8 }}>
          <Link to="/" style={linkStyle}>Home</Link>
          <Link to="/films" style={linkStyle}>Films</Link>
          <Link to="/series" style={linkStyle}>Series</Link>
          <Link to="/my-list" style={linkStyle}>My List</Link>
          <Link to="/" style={linkStyle}>History</Link>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              backgroundColor: currentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 14,
            }}
          >
            {currentProfile.name[0]}
          </div>
          <span style={{ color: '#fff', fontSize: 12 }}>▼</span>
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              backgroundColor: '#222',
              borderRadius: 4,
              padding: 8,
              minWidth: 150,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 100,
            }}
          >
            {profiles.map((profile) => (
              <div
                key={profile.profileId}
                onClick={() => {
                  setActiveProfile(profile);
                  setDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderRadius: 4,
                  backgroundColor: currentProfile.profileId === profile.profileId ? '#333' : 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = currentProfile.profileId === profile.profileId ? '#333' : 'transparent')}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    backgroundColor: profile.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 12,
                  }}
                >
                  {profile.name[0]}
                </div>
                <span style={{ color: '#fff', fontSize: 14 }}>{profile.name}</span>
                {currentProfile.profileId === profile.profileId && (
                  <span style={{ color: '#46d369', marginLeft: 'auto' }}>✓</span>
                )}
              </div>
            ))}
            <div style={{ borderTop: '1px solid #444', marginTop: 8, paddingTop: 8 }}>
              <Link
                to="/"
                style={{
                  display: 'block',
                  color: '#ccc',
                  textDecoration: 'none',
                  padding: '8px 12px',
                  fontSize: 14,
                }}
                onClick={() => setDropdownOpen(false)}
              >
                Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
