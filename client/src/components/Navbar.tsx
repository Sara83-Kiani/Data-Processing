import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

const PROFILE_COLORS = ['#e50914', '#46d369', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4'];

function getProfileColor(profileId: number): string {
  return PROFILE_COLORS[profileId % PROFILE_COLORS.length];
}

export default function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { activeProfile, setActiveProfile, profiles } = useProfile();

  const linkStyle = {
    color: '#ccc',
    textDecoration: 'none',
    padding: '8px 16px',
    fontSize: 14,
  };

  const currentProfile = activeProfile;
  const currentColor = currentProfile ? getProfileColor(currentProfile.profileId) : '#e50914';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('activeProfile');
    setActiveProfile(null);
    setDropdownOpen(false);
    navigate('/login');
  };

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
          <Link to="/my-list" style={linkStyle}>Watchlist</Link>
          <Link to="/history" style={linkStyle}>History</Link>
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
            {currentProfile?.name[0] || '?'}
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
                  backgroundColor: currentProfile?.profileId === profile.profileId ? '#333' : 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = currentProfile?.profileId === profile.profileId ? '#333' : 'transparent')}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    backgroundColor: getProfileColor(profile.profileId),
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
                {currentProfile?.profileId === profile.profileId && (
                  <span style={{ color: '#46d369', marginLeft: 'auto' }}>✓</span>
                )}
              </div>
            ))}
            <div style={{ borderTop: '1px solid #444', marginTop: 8, paddingTop: 8 }}>
              <Link
                to="/account"
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
              <button
                onClick={handleLogout}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: '#ccc',
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
