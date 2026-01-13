import { useState, useEffect } from 'react';

interface AccountInfo {
  accountId: number;
  email: string;
  registrationDate: string;
  subscriptionId: number | null;
  referralCode: string;
  isTrialUsed: boolean;
}

export default function Account() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  async function fetchAccountInfo() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch('http://localhost:3000/accounts/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load account info');
      }

      setAccount(data.data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load account information.');
    } finally {
      setLoading(false);
    }
  }

  function copyInviteLink() {
    if (!account?.referralCode) return;
    
    const inviteLink = `${window.location.origin}/register?ref=${account.referralCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  function handleLogout() {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-card">
          <p>Loading account information...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="account-page">
        <div className="account-card">
          <div className="auth-error">{errorMsg}</div>
          <button className="auth-button" onClick={() => window.location.href = '/login'}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-card">
        <h1 className="account-title">My Account</h1>

        <div className="account-section">
          <h2>Account Information</h2>
          <div className="account-info">
            <div className="account-row">
              <span className="account-label">Email:</span>
              <span className="account-value">{account?.email}</span>
            </div>
            <div className="account-row">
              <span className="account-label">Member since:</span>
              <span className="account-value">
                {account?.registrationDate 
                  ? new Date(account.registrationDate).toLocaleDateString() 
                  : 'N/A'}
              </span>
            </div>
            <div className="account-row">
              <span className="account-label">Subscription:</span>
              <span className="account-value">
                {account?.subscriptionId ? `Plan #${account.subscriptionId}` : 'No active subscription'}
              </span>
            </div>
            <div className="account-row">
              <span className="account-label">Trial used:</span>
              <span className="account-value">{account?.isTrialUsed ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="account-section">
          <h2>Invite Friends</h2>
          <p className="account-description">
            Share your referral link with friends. When they subscribe, you both get a discount!
          </p>
          <div className="invite-section">
            <div className="referral-code">
              <span className="account-label">Your referral code:</span>
              <span className="account-value code">{account?.referralCode || 'N/A'}</span>
            </div>
            <button 
              className="auth-button secondary" 
              onClick={copyInviteLink}
              disabled={!account?.referralCode}
            >
              {copySuccess ? 'Copied!' : 'Copy Invite Link'}
            </button>
          </div>
        </div>

        <div className="account-section">
          <h2>Security</h2>
          <div className="account-actions">
            <a href="/forgot-password" className="auth-link">
              Change Password
            </a>
          </div>
        </div>

        <div className="account-footer">
          <button className="auth-button danger" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
