import { createContext, useContext, type ReactNode } from 'react';
import { useStore } from './useStore';

type StoreType = ReturnType<typeof useStore>;

const AppContext = createContext<StoreType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
