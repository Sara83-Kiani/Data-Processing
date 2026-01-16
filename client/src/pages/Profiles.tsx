import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProfile, deleteProfile, getProfiles, type Profile } from '../services/profiles.api';
import { useProfile } from '../context/ProfileContext';

export default function Profiles() {
  const navigate = useNavigate();
  const { setActiveProfile, setProfiles: setContextProfiles } = useProfile();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(18);

  function avatarUrlForProfile(profileId: number) {
    const avatarCount = 4;
    const idx = ((profileId % avatarCount) + avatarCount) % avatarCount;
    return `/avatars/avatar-${idx + 1}.svg`;
  }

  async function refresh() {
    setErr('');
    setLoading(true);
    try {
      const rows = await getProfiles();
      setProfiles(rows);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await createProfile({ name, age, language: 'ENGLISH' });
      setName('');
      setAge(18);
      await refresh();
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to create profile');
    }
  }

  function selectProfile(p: Profile) {
    setActiveProfile({ 
      profileId: p.profileId, 
      name: p.name, 
      age: p.age, 
      image: avatarUrlForProfile(p.profileId) 
    });
    setContextProfiles(profiles.map(pr => ({
      profileId: pr.profileId,
      name: pr.name,
      age: pr.age,
      image: avatarUrlForProfile(pr.profileId)
    })));
    navigate('/');
  }

  async function onDelete(p: Profile) {
    if (!confirm(`Delete profile "${p.name}"?`)) return;
    setErr('');
    try {
      await deleteProfile(p.profileId);
      await refresh();
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to delete profile');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Who’s watching?</h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <a className="auth-link" href="/account">Account</a>
          <a className="auth-link" href="/login" onClick={() => localStorage.removeItem('accessToken')}>
            Log out
          </a>
        </div>

        {err ? <div className="auth-error">{err}</div> : null}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {profiles.map((p) => (
              <div
                key={p.profileId}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: 12,
                  cursor: 'pointer',
                }}
              >
                <div onClick={() => selectProfile(p)} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img
                    src={avatarUrlForProfile(p.profileId)}
                    alt=""
                    style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flex: '0 0 auto' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Age: {p.age}</div>
                  </div>
                </div>

                <button
                  className="auth-button"
                  style={{ marginTop: 10, background: '#ef4444' }}
                  onClick={() => onDelete(p)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

        <h2 style={{ margin: 0, fontSize: 16 }}>Add profile</h2>

        <form className="auth-form" onSubmit={onCreate} style={{ marginTop: 10 }}>
          <label className="auth-label">
            Name
            <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label className="auth-label">
            Age
            <input
              className="auth-input"
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              min={0}
              required
            />
          </label>

          <button className="auth-button" type="submit">
            Create profile
          </button>
        </form>
      </div>
    </div>
  );
}
