import { useState } from 'react';
import { forgotPassword } from '../services/auth.api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      setSuccessMsg(result.message || 'If an account with that email exists, a password reset link has been sent.');
      setEmail('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>

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

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {successMsg && <div className="auth-success">{successMsg}</div>}
        {errorMsg && <div className="auth-error">{errorMsg}</div>}

        <div className="auth-footer">
          Remember your password?{' '}
          <a className="auth-link" href="/login">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
