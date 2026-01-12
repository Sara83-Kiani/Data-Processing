import { useState, useEffect } from 'react';
import { resetPassword } from '../services/auth.api';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setErrorMsg('Invalid reset link. Please request a new password reset.');
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, newPassword);
      setSuccessMsg(result.message || 'Password has been reset successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = '/login?reset=1';
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">
          Enter your new password below.
        </p>

        {!token ? (
          <div className="auth-error">{errorMsg}</div>
        ) : (
          <>
            <form className="auth-form" onSubmit={onSubmit}>
              <label className="auth-label">
                New Password
                <input
                  className="auth-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>

              <label className="auth-label">
                Confirm Password
                <input
                  className="auth-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>

              <button className="auth-button" type="submit" disabled={loading || !!successMsg}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            {successMsg && (
              <div className="auth-success">
                {successMsg}
                <p style={{ fontSize: '0.9em', marginTop: '8px' }}>
                  Redirecting to login...
                </p>
              </div>
            )}
            {errorMsg && <div className="auth-error">{errorMsg}</div>}
          </>
        )}

        <div className="auth-footer">
          <a className="auth-link" href="/login">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
