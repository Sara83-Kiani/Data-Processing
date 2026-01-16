import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface Profile {
  profileId: number;
  name: string;
  image: string;
  age: number;
}

interface ProfileContextType {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile | null) => void;
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(() => {
    const stored = localStorage.getItem('activeProfile');
    return stored ? JSON.parse(stored) : null;
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (activeProfile) {
      localStorage.setItem('activeProfile', JSON.stringify(activeProfile));
    } else {
      localStorage.removeItem('activeProfile');
    }
  }, [activeProfile]);

  return (
    <ProfileContext.Provider
      value={{ activeProfile, setActiveProfile, profiles, setProfiles }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
