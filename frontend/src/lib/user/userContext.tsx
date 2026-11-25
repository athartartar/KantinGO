import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Settings, User } from "./types";
import { authApi, getUser as fetchUserApi, updateUser as updateUserApi } from "../api";
import { getAuthUser, isAuthenticated, isMockMode } from "../auth";

const USER_STORAGE_KEY = "kantingo_user_v1";
const SETTINGS_STORAGE_KEY = "kantingo_settings_v1";

const emptyUser: User = {
  id: "",
  nama: "",
  username: "",
  email: "",
  noHp: "",
  avatar: "",
  poin: 0,
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
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<User>;
  updateSettings: (data: Partial<Settings>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

function getInitialUser(): User {
  if (!isAuthenticated()) {
    return emptyUser;
  }
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      return { ...emptyUser, ...JSON.parse(saved) };
    }
  } catch {}
  const authUser = getAuthUser();
  if (authUser) {
    return {
      id: String(authUser.id),
      nama: authUser.name,
      username: authUser.email.split("@")[0] || "",
      email: authUser.email,
      noHp: authUser.phone || "",
      avatar: authUser.avatar_path || "",
      poin: Number(authUser.points ?? 0),
    };
  }
  return emptyUser;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(() => getInitialUser());

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...initialSettings, ...JSON.parse(saved) };
      }
    } catch {}
    return initialSettings;
  });

  const refreshUser = useCallback(async () => {
    if (!isMockMode() && isAuthenticated()) {
      try {
        const remoteUser = await fetchUserApi();
        setUser(remoteUser);
      } catch {
        setUser(emptyUser);
      }
    } else if (!isAuthenticated()) {
      setUser(emptyUser);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    try {
      if (isAuthenticated() && user.id) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
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

  const updateUser = useCallback(
    async (data: Partial<User>): Promise<User> => {
      if (!isMockMode() && isAuthenticated()) {
        const updated = await updateUserApi(data);
        setUser(updated);
        return updated;
      }
      const next = { ...user, ...data };
      setUser(next);
      return next;
    },
    [user]
  );

  const updateSettings = useCallback((data: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...data }));
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {}
    setUser(emptyUser);
    setSettings(initialSettings);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        settings,
        getUser,
        refreshUser,
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
