import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Settings, User } from "./types";

const USER_STORAGE_KEY = "kantingo_user_v1";
const SETTINGS_STORAGE_KEY = "kantingo_settings_v1";

const initialUser: User = {
  id: "usr-01",
  nama: "Radhitya Fadhil",
  username: "radhityafadhil",
  email: "radhitya.fadhil@kampus.ac.id",
  noHp: "081234567890",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  poin: 1250,
};

const initialSettings: Settings = {
  notifikasiPesanan: true,
  notifikasiPromo: true,
  tema: "terang",
};

interface UserContextValue {
  user: User;
  settings: Settings;
  getUser: () => User;
  updateUser: (data: Partial<User>) => void;
  updateSettings: (data: Partial<Settings>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        return { ...initialUser, ...JSON.parse(saved) };
      }
    } catch {}
    return initialUser;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...initialSettings, ...JSON.parse(saved) };
      }
    } catch {}
    return initialSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const getUser = useCallback(() => {
    return user;
  }, [user]);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...data }));
  }, []);

  const updateSettings = useCallback((data: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...data }));
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {}
    setUser(initialUser);
    setSettings(initialSettings);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        settings,
        getUser,
        updateUser,
        updateSettings,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
