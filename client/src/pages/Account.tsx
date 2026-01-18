import { useEffect, useState } from 'react';
import { createInvitation, getSubscriptionMe, listMyInvitations, subscribe } from '../services/accounts.api';
import '../styles/account.css';

export default function AccountPage() {
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [invited, setInvited] = useState<any[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const s = await getSubscriptionMe();
      setSub(s.subscription);
      const inv = await listMyInvitations();
      setInvited(inv);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubscribe(q: 'SD' | 'HD' | 'UHD') {
    setErr('');
    setMsg('');
    try {
      const res = await subscribe(q, 'CARD');
      setMsg(res.message ?? 'Subscription updated');
      await refresh();
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to subscribe');
    }
  }

  async function onCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
      const res = await createInvitation(inviteEmail);
      setInviteEmail('');
      setMsg(res.emailSent ? 'Invitation sent.' : 'Invitation created. (Email not sent)');
      await refresh();
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to create invitation');
    }
  }

  return (
    <div className="account-page">
      <div className="auth-card">
        <h1 className="auth-title">Account</h1>

        <div className="account-nav">
          <a className="auth-link" href="/profiles">Back to profiles</a>
          <a className="auth-link" href="/">Home</a>
        </div>

        {err ? <div className="auth-error">{err}</div> : null}
        {msg ? <div className="auth-success">{msg}</div> : null}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h2 className="account-section-title">Subscription</h2>

            {sub ? (
              <div className="account-box">
                <div><strong>Plan:</strong> {sub.quality}</div>
                <div><strong>Status:</strong> {sub.status}</div>
                <div><strong>Price:</strong> {sub.price}</div>
                <div><strong>Trial:</strong> {sub.isTrial ? 'Yes' : 'No'}</div>
                {sub.discountAmount && Number(sub.discountAmount) > 0 ? (
                  <div>
                    <strong>Discount:</strong> {sub.discountAmount} until {sub.discountValidUntil ? new Date(sub.discountValidUntil).toLocaleDateString() : '—'}
                  </div>
                ) : (
                  <div><strong>Discount:</strong> none</div>
                )}
              </div>
            ) : (
              <div className="account-box">
                No subscription yet.
              </div>
            )}

            <div className="account-plan-actions">
              <button
                className="auth-button"
                type="button"
                onClick={() => onSubscribe('SD')}
              >
                Choose SD
              </button>
              <button
                className="auth-button"
                type="button"
                onClick={() => onSubscribe('HD')}
              >
                Choose HD
              </button>
              <button
                className="auth-button"
                type="button"
                onClick={() => onSubscribe('UHD')}
              >
                Choose UHD
              </button>
            </div>

            <hr className="account-divider" />

            <h2 className="account-section-title">Invite people</h2>

            <form className="auth-form" onSubmit={onCreateInvite}>
              <label className="auth-label">
                Invitee email
                <input
                  className="auth-input"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="friend@example.com"
                />
              </label>
              <button className="auth-button" type="submit">Send invitation</button>
            </form>

            <h2 className="account-section-title account-section-title-spaced">
              Invited people
            </h2>

            {invited.length ? (
              <div className="account-invited-list">
                {invited.map((i) => (
                  <div key={i.invitationId} className="account-box">
                    <div><strong>Email:</strong> {i.inviteeEmail}</div>
                    <div><strong>Status:</strong> {i.status}</div>
                    <div><strong>Code:</strong> {i.invitationCode}</div>
                    <div><strong>Discount applied:</strong> {i.discountApplied ? 'Yes' : 'No'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="account-box">
                No invitations yet.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
