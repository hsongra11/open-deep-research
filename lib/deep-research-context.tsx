'use client';

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from 'react';

interface ActivityItem {
  type:
    | 'search'
    | 'extract'
    | 'analyze'
    | 'reasoning'
    | 'synthesis'
    | 'thought';
  status: 'pending' | 'complete' | 'error';
  message: string;
  timestamp: string;
  depth?: number;
}

interface SourceItem {
  url: string;
  title: string;
  relevance: number;
}

interface HyperResearchState {
  isActive: boolean;
  activity: ActivityItem[];
  sources: SourceItem[];
  currentDepth: number;
  maxDepth: number;
  completedSteps: number;
  totalExpectedSteps: number;
}

type HyperResearchAction =
  | { type: 'TOGGLE_ACTIVE' }
  | { type: 'SET_ACTIVE'; payload: boolean }
  | {
      type: 'ADD_ACTIVITY';
      payload: ActivityItem & { completedSteps?: number; totalSteps?: number };
    }
  | { type: 'ADD_SOURCE'; payload: SourceItem }
  | { type: 'SET_DEPTH'; payload: { current: number; max: number } }
  | { type: 'INIT_PROGRESS'; payload: { maxDepth: number; totalSteps: number } }
  | { type: 'UPDATE_PROGRESS'; payload: { completed: number; total: number } }
  | { type: 'CLEAR_STATE' };

interface HyperResearchContextType {
  state: HyperResearchState;
  toggleActive: () => void;
  setActive: (active: boolean) => void;
  addActivity: (
    activity: ActivityItem & { completedSteps?: number; totalSteps?: number },
  ) => void;
  addSource: (source: SourceItem) => void;
  setDepth: (current: number, max: number) => void;
  initProgress: (maxDepth: number, totalSteps: number) => void;
  updateProgress: (completed: number, total: number) => void;
  clearState: () => void;
}

const initialState: HyperResearchState = {
  isActive: false,
  activity: [],
  sources: [],
  currentDepth: 0,
  maxDepth: 0,
  completedSteps: 0,
  totalExpectedSteps: 0,
};

const HyperResearchContext = createContext<HyperResearchContextType | undefined>(
  undefined,
);

function hyperResearchReducer(
  state: HyperResearchState,
  action: HyperResearchAction,
): HyperResearchState {
  switch (action.type) {
    case 'TOGGLE_ACTIVE':
      return {
        ...state,
        isActive: !state.isActive,
      };
    case 'SET_ACTIVE':
      return {
        ...state,
        isActive: action.payload,
      };
    case 'ADD_ACTIVITY':
      // Update progress if provided
      const updatedProgress =
        action.payload.completedSteps !== undefined &&
        action.payload.totalSteps !== undefined
          ? {
              completedSteps: action.payload.completedSteps,
              totalExpectedSteps: action.payload.totalSteps,
            }
          : {};

      // Only add if the message doesn't already exist
      const isDuplicate = state.activity.some(
        (item) => item.message === action.payload.message,
      );

      if (isDuplicate) {
        return {
          ...state,
          ...updatedProgress,
        };
      }

      return {
        ...state,
        activity: [...state.activity, action.payload],
        ...updatedProgress,
      };
    case 'ADD_SOURCE':
      // Check if we already have this source
      const sourceExists = state.sources.some(
        (s) => s.url === action.payload.url,
      );

      if (sourceExists) {
        return state;
      }

      return {
        ...state,
        sources: [...state.sources, action.payload],
      };
    case 'SET_DEPTH':
      return {
        ...state,
        currentDepth: action.payload.current,
        maxDepth: action.payload.max,
      };
    case 'INIT_PROGRESS':
      return {
        ...state,
        maxDepth: action.payload.maxDepth,
        totalExpectedSteps: action.payload.totalSteps,
        completedSteps: 0,
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        completedSteps: action.payload.completed,
        totalExpectedSteps: action.payload.total,
      };
    case 'CLEAR_STATE':
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

export function HyperResearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(hyperResearchReducer, initialState);

  const toggleActive = useCallback(() => {
    dispatch({ type: 'TOGGLE_ACTIVE' });
  }, []);

  const setActive = useCallback((active: boolean) => {
    dispatch({ type: 'SET_ACTIVE', payload: active });
  }, []);

  const addActivity = useCallback(
    (
      activity: ActivityItem & {
        completedSteps?: number;
        totalSteps?: number;
      },
    ) => {
      dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    },
    [],
  );

  const addSource = useCallback((source: SourceItem) => {
    dispatch({ type: 'ADD_SOURCE', payload: source });
  }, []);

  const setDepth = useCallback((current: number, max: number) => {
    dispatch({ type: 'SET_DEPTH', payload: { current, max } });
  }, []);

  const initProgress = useCallback((maxDepth: number, totalSteps: number) => {
    dispatch({
      type: 'INIT_PROGRESS',
      payload: { maxDepth, totalSteps },
    });
  }, []);

  const updateProgress = useCallback((completed: number, total: number) => {
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: { completed, total },
    });
  }, []);

  const clearState = useCallback(() => {
    dispatch({ type: 'CLEAR_STATE' });
  }, []);

  return (
    <HyperResearchContext.Provider
      value={{
        state,
        toggleActive,
        setActive,
        addActivity,
        addSource,
        setDepth,
        initProgress,
        updateProgress,
        clearState,
      }}
    >
      {children}
    </HyperResearchContext.Provider>
  );
}

export function useHyperResearch() {
  const context = useContext(HyperResearchContext);
  if (context === undefined) {
    throw new Error(
      'useHyperResearch must be used within a HyperResearchProvider',
    );
  }
  return context;
}

// For backward compatibility, maintain the old function name as an alias
export function useDeepResearch() {
  return useHyperResearch();
}
