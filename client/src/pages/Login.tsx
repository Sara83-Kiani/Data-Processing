import { useEffect, useState } from 'react';
import '../styles/login.css';
import { loginUser } from '../services/auth.api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Show popup if user came from activation redirect: /login?activated=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('activated') === '1') {
      setInfoMsg('Registration is complete, you can log in.');

      // Optional: remove query param so it doesn't show again on refresh
      params.delete('activated');
      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const token = await loginUser(email, password);

      // Minimal: store token so you can use it later for protected requests
      localStorage.setItem('accessToken', token);

      // Minimal “success”: redirect to home (change if you have a different route)
      window.location.href = '/';
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Log in</h1>

        {infoMsg ? (
          <div className="auth-info">
            <span>{infoMsg}</span>
            <button className="auth-info-close" onClick={() => setInfoMsg('')}>
              ✕
            </button>
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
              placeholder="Your password"
              required
              autoComplete="current-password"
            />
          </label>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        {errorMsg ? <div className="auth-error">{errorMsg}</div> : null}

        <div className="auth-footer">
          Don’t have an account?{' '}
          <a className="auth-link" href="/register">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
