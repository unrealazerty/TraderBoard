import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_TRADES, type Trade } from "./mock-data";

// -------- Auth ----------
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  capital: number;
  currency: string;
  language: "fr" | "en";
}

interface AuthState {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  changePassword: (oldPwd: string, newPwd: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

const AUTH_KEY = "tradeboard.user";
const TRADES_KEY = "tradeboard.trades";
const FAV_KEY = "tradeboard.favorites";

function readLS<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(v));
}

// -------- Trades store --------
interface TradesState {
  trades: Trade[];
  addTrade: (t: Omit<Trade, "id">) => Trade;
  updateTrade: (id: string, patch: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  duplicateTrade: (id: string) => void;
  importTrades: (rows: Omit<Trade, "id">[]) => number;
  resetTrades: () => void;
}

// -------- Favorites (watchlist) --------
interface FavState {
  favorites: string[];
  toggleFavorite: (sym: string) => void;
}

interface StoreState extends AuthState, TradesState, FavState {}

const StoreCtx = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Hydrate on mount (client-only)
  useEffect(() => {
    setUser(readLS<User | null>(AUTH_KEY, null));
    setTrades(readLS<Trade[]>(TRADES_KEY, MOCK_TRADES));
    setFavorites(readLS<string[]>(FAV_KEY, ["EURUSD", "XAUUSD", "BTCUSD"]));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeLS(TRADES_KEY, trades);
  }, [trades, ready]);
  useEffect(() => {
    if (ready) writeLS(FAV_KEY, favorites);
  }, [favorites, ready]);

  const persistUser = useCallback((u: User | null) => {
    setUser(u);
    if (u) writeLS(AUTH_KEY, u);
    else if (typeof window !== "undefined") window.localStorage.removeItem(AUTH_KEY);
  }, []);

  const login = useCallback(
    async (email: string, _password: string) => {
      await new Promise((r) => setTimeout(r, 300));
      const name = email.split("@")[0];
      persistUser({
        id: "u_1",
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        capital: 10000,
        currency: "USD",
        language: "fr",
      });
    },
    [persistUser],
  );

  const register = useCallback(
    async (name: string, email: string, _password: string) => {
      await new Promise((r) => setTimeout(r, 400));
      persistUser({
        id: "u_1",
        name,
        email,
        capital: 10000,
        currency: "USD",
        language: "fr",
      });
    },
    [persistUser],
  );

  const logout = useCallback(() => persistUser(null), [persistUser]);

  const updateUser = useCallback(
    (patch: Partial<User>) => {
      setUser((u) => {
        if (!u) return u;
        const next = { ...u, ...patch };
        writeLS(AUTH_KEY, next);
        return next;
      });
    },
    [],
  );

  const changePassword = useCallback(async (_o: string, _n: string) => {
    await new Promise((r) => setTimeout(r, 300));
  }, []);

  const resetPassword = useCallback(async (_email: string) => {
    await new Promise((r) => setTimeout(r, 300));
  }, []);

  const addTrade = useCallback((t: Omit<Trade, "id">) => {
    const nt: Trade = { ...t, id: `t_${Date.now()}` };
    setTrades((prev) => [nt, ...prev]);
    return nt;
  }, []);

  const updateTrade = useCallback((id: string, patch: Partial<Trade>) => {
    setTrades((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteTrade = useCallback((id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const duplicateTrade = useCallback((id: string) => {
    setTrades((prev) => {
      const src = prev.find((t) => t.id === id);
      if (!src) return prev;
      return [{ ...src, id: `t_${Date.now()}` }, ...prev];
    });
  }, []);

  const importTrades = useCallback((rows: Omit<Trade, "id">[]) => {
    const withIds: Trade[] = rows.map((r, i) => ({
      ...r,
      id: `t_${Date.now()}_${i}`,
    }));
    setTrades((prev) =>
      [...withIds, ...prev].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    );
    return withIds.length;
  }, []);

  const resetTrades = useCallback(() => setTrades(MOCK_TRADES), []);

  const toggleFavorite = useCallback((sym: string) => {
    setFavorites((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym],
    );
  }, []);

  const value = useMemo<StoreState>(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      updateUser,
      changePassword,
      resetPassword,
      trades,
      addTrade,
      updateTrade,
      deleteTrade,
      duplicateTrade,
      importTrades,
      resetTrades,
      favorites,
      toggleFavorite,
    }),
    [
      user, ready, login, register, logout, updateUser, changePassword, resetPassword,
      trades, addTrade, updateTrade, deleteTrade, duplicateTrade, importTrades, resetTrades,
      favorites, toggleFavorite,
    ],
  );

  return (
    <StoreCtx.Provider value={value}>
      <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("StoreProvider missing");
  return ctx;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("StoreProvider missing");
  return ctx;
}