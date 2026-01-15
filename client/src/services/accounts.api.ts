import { authedFetch } from './authedFetch';

export function getAccountMe() {
  return authedFetch<{ success: boolean; data: any }>('/accounts/me');
}

export function getSubscriptionMe() {
  return authedFetch<{ account: any; subscription: any }>('/subscriptions/me');
}

export function subscribe(quality: 'SD' | 'HD' | 'UHD', paymentMethod?: string) {
  return authedFetch<any>('/subscriptions/subscribe', {
    method: 'POST',
    body: JSON.stringify({ quality, paymentMethod }),
  });
}

export function createInvitation(inviteeEmail: string) {
  return authedFetch<{ invitationCode: string; registerUrl: string }>(
    '/invitations',
    {
      method: 'POST',
      body: JSON.stringify({ inviteeEmail }),
    },
  );
}

export function listMyInvitations() {
  return authedFetch<any[]>('/invitations/me');
}
