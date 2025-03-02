'use client';

import { createContext, useContext, useReducer } from 'react';
import type { UnsplashFilter } from '@/types/unsplash';

interface FiltersProviderProps {
  children: React.ReactNode;
}

type FilterAction =
  | { type: 'SET_QUERY'; payload: string | undefined }
  | {
      type: 'SET_ORIENTATION';
      payload: 'landscape' | 'portrait' | 'squarish' | undefined;
    }
  | { type: 'SET_COLOR'; payload: string | undefined }
  | { type: 'SET_ORDER_BY'; payload: 'relevant' | 'latest' | undefined }
  | { type: 'SET_PER_PAGE'; payload: number | undefined }
  | { type: 'CLEAR_FILTERS'; payload: undefined };

interface FiltersContextType {
  filters: Omit<UnsplashFilter, 'page'>; // Let the scroller handle the pagination
  dispatch: React.Dispatch<FilterAction>;
}

const initialFilters: UnsplashFilter = {};

const filtersReducer = (state: UnsplashFilter, action: FilterAction): UnsplashFilter => {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'SET_ORIENTATION':
      return { ...state, orientation: action.payload };
    case 'SET_COLOR':
      return { ...state, color: action.payload };
    case 'SET_ORDER_BY':
      return { ...state, orderBy: action.payload };
    case 'SET_PER_PAGE':
      return { ...state, perPage: action.payload };
    case 'CLEAR_FILTERS':
      return initialFilters;
    default:
      return state;
  }
};

const FiltersContext = createContext<FiltersContextType | null>(null);

export const FiltersProvider = ({ children }: FiltersProviderProps) => {
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters);

  return (
    <FiltersContext.Provider value={{ filters, dispatch }}>{children}</FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
};
