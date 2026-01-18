import { useState } from 'react';
import '../styles/register.css';
import { registerUser } from '../services/auth.api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const msg = await registerUser(email, password);
      setSuccessMsg(msg);

      // optional: clear form
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
