import { useEffect, useState } from 'react';
import '../styles/register.css';
import { registerUser } from '../services/auth.api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [invitationCode, setInvitationCode] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // If user arrived via invite link: /register?code=INV-XXXX
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) setInvitationCode(code);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      // Pass invitationCode if present
      const msg = await registerUser(email, password, invitationCode || undefined);
      setSuccessMsg(msg);

      setEmail('');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Register</h1>

        {invitationCode ? (
          <div className="auth-info" style={{ marginBottom: 12 }}>
            You’re joining via invitation: <strong>{invitationCode}</strong>
          </div>
        ) : null}

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              autoComplete="new-password"
            />
          </label>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {successMsg ? <div className="auth-success">{successMsg}</div> : null}
        {errorMsg ? <div className="auth-error">{errorMsg}</div> : null}

        <div className="auth-footer">
          Already have an account?{' '}
          <a className="auth-link" href="/login">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
