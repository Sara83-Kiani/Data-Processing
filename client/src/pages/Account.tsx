import { useEffect, useState } from 'react';
import { createInvitation, getSubscriptionMe, listMyInvitations, subscribe } from '../services/accounts.api';

export default function AccountPage() {
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [invited, setInvited] = useState<any[]>([]);

  async function refresh() {
    setErr('');
    setMsg('');
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
    setInviteUrl('');
    try {
      const res = await createInvitation(inviteEmail);
      setInviteUrl(res.registerUrl);
      setInviteEmail('');
      setMsg('Invitation created.');
      await refresh();
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to create invitation');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Account</h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <a className="auth-link" href="/profiles">Back to profiles</a>
          <a className="auth-link" href="/">Home</a>
        </div>

        {err ? <div className="auth-error">{err}</div> : null}
        {msg ? <div className="auth-success">{msg}</div> : null}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h2 style={{ margin: '8px 0', fontSize: 16 }}>Subscription</h2>

            {sub ? (
              <div style={{ border: '1px solid #e6e8ef', borderRadius: 12, padding: 12 }}>
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
              <div style={{ border: '1px solid #e6e8ef', borderRadius: 12, padding: 12 }}>
                No subscription yet.
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="auth-button" type="button" onClick={() => onSubscribe('SD')}>Choose SD</button>
              <button className="auth-button" type="button" onClick={() => onSubscribe('HD')}>Choose HD</button>
              <button className="auth-button" type="button" onClick={() => onSubscribe('UHD')}>Choose UHD</button>
            </div>

            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #eee' }} />

            <h2 style={{ margin: '8px 0', fontSize: 16 }}>Invite people</h2>

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
              <button className="auth-button" type="submit">Create invitation link</button>
            </form>

            {inviteUrl ? (
              <div className="auth-success" style={{ marginTop: 12 }}>
                Invitation link:
                <div style={{ wordBreak: 'break-all', marginTop: 6 }}>
                  <code>{inviteUrl}</code>
                </div>
              </div>
            ) : null}

            <h2 style={{ margin: '16px 0 8px', fontSize: 16 }}>Invited people</h2>

            {invited.length ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {invited.map((i) => (
                  <div key={i.invitationId} style={{ border: '1px solid #e6e8ef', borderRadius: 12, padding: 12 }}>
                    <div><strong>Email:</strong> {i.inviteeEmail}</div>
                    <div><strong>Status:</strong> {i.status}</div>
                    <div><strong>Code:</strong> {i.invitationCode}</div>
                    <div><strong>Discount applied:</strong> {i.discountApplied ? 'Yes' : 'No'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ border: '1px solid #e6e8ef', borderRadius: 12, padding: 12 }}>
                No invitations yet.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
