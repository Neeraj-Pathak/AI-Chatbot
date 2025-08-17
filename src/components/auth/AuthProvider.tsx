import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NhostClient } from '@nhost/nhost-js';

interface User {
  id: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const useAccessToken = () => {
  const context = useAuth();
  return context.accessToken;
};

export const useUserData = () => {
  const context = useAuth();
  return context.user;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Initialize Nhost Auth client using environment variables
const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION,
});


export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = nhost.auth.getUser();
        const token = nhost.auth.getAccessToken();
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            displayName: currentUser.displayName || undefined,
          });
          setAccessToken(token);
        }

        const unsubscribe = nhost.auth.onAuthStateChanged((event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              displayName: session.user.displayName || undefined,
            });
            setAccessToken(session?.accessToken || null);
          } else {
            setUser(null);
            setAccessToken(null);
          }
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { session, error } = await nhost.auth.signIn({ email, password });
    if (error) throw error;

    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.displayName || undefined,
      });
      setAccessToken(session?.accessToken || null);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error, session } = await nhost.auth.signUp({
      email,
      password,
      options: {
        metadata: { displayName },
      },
    });
    if (error) throw error;

    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        displayName: displayName,
      });
      setAccessToken(session?.accessToken || null);
    }
  };

  const signOut = async () => {
    const { error } = await nhost.auth.signOut();
    if (error) throw error;
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
