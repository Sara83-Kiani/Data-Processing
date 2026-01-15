import { authedFetch } from './authedFetch';

export type Profile = {
  profileId: number;
  accountId: number;
  name: string;
  image: string;
  age: number;
  language: 'ENGLISH' | 'DUTCH';
};

export function getProfiles() {
  return authedFetch<Profile[]>('/profiles');
}

export function createProfile(payload: {
  name: string;
  age?: number;
  language?: 'ENGLISH' | 'DUTCH';
  image?: string;
}) {
  return authedFetch<Profile>('/profiles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProfile(
  profileId: number,
  payload: Partial<{
    name: string;
    age: number;
    language: 'ENGLISH' | 'DUTCH';
    image: string;
  }>,
) {
  return authedFetch<Profile>(`/profiles/${profileId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteProfile(profileId: number) {
  return authedFetch<{ message: string }>(`/profiles/${profileId}`, {
    method: 'DELETE',
  });
}

export function getProfilePreferences(profileId: number) {
  return authedFetch<{ genreId: number; classificationId: number }[]>(
    `/profiles/${profileId}/preferences`,
  );
}

export function setProfilePreferences(
  profileId: number,
  items: { genreId: number; classificationId: number }[],
) {
  return authedFetch<{ message: string }>(`/profiles/${profileId}/preferences`, {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });
}
