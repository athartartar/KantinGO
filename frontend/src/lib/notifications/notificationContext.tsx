import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AppNotification } from "./types";

const STORAGE_KEY = "kantingo_notifications_v1";
const SETTINGS_KEY = "kantingo_settings_v1";

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "sudahDibaca">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

function loadFromStorage(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadFromStorage()
  );

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.sudahDibaca).length;

  const addNotification = useCallback(
    (n: Omit<AppNotification, "id" | "sudahDibaca">) => {
      setNotifications((prev) => {
        // Avoid duplicate by orderId+jenis
        if (prev.some((x) => x.orderId === n.orderId && x.jenis === n.jenis)) {
          return prev;
        }
        const newNotif: AppNotification = {
          ...n,
          id: Date.now().toString(36),
          sudahDibaca: false,
        };
        return [newNotif, ...prev];
      });
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, sudahDibaca: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, sudahDibaca: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return ctx;
};

/**
 * Standalone helper to add a notification directly to localStorage.
 * Called from orderContext to avoid circular dependency.
 * Respects the `notifikasiPesanan` setting from kantingo_settings_v1.
 */
export function addNotificationToStorage(
  n: Omit<AppNotification, "id" | "sudahDibaca">
): void {
  try {
    // Check settings
    const settingsRaw = localStorage.getItem(SETTINGS_KEY);
    if (settingsRaw) {
      const settings = JSON.parse(settingsRaw);
      if (settings.notifikasiPesanan === false) return;
    }

    // Load current notifications
    const raw = localStorage.getItem(STORAGE_KEY);
    const current: AppNotification[] = raw ? JSON.parse(raw) : [];

    // Check for duplicate orderId+jenis
    if (current.some((x) => x.orderId === n.orderId && x.jenis === n.jenis)) {
      return;
    }

    const newNotif: AppNotification = {
      ...n,
      id: Date.now().toString(36),
      sudahDibaca: false,
    };

    const updated = [newNotif, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
