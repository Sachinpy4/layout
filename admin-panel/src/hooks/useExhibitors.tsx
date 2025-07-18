import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { message } from 'antd';
import exhibitorService, { 
  ExhibitorProfile, 
  ExhibitorQueryParams, 
  ExhibitorListResponse, 
  ExhibitorStats,
  CreateExhibitorDto,
  UpdateExhibitorDto
} from '../services/exhibitor.service';

// Types
interface ExhibitorState {
  exhibitors: ExhibitorProfile[];
  loading: boolean;
  error: string | null;
  selectedExhibitor: ExhibitorProfile | null;
  stats: ExhibitorStats;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    status?: 'pending' | 'approved' | 'rejected' | 'suspended';
    isActive?: boolean;
  };
}

type ExhibitorAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EXHIBITORS'; payload: ExhibitorListResponse }
  | { type: 'SET_SELECTED_EXHIBITOR'; payload: ExhibitorProfile | null }
  | { type: 'SET_STATS'; payload: ExhibitorStats }
  | { type: 'UPDATE_EXHIBITOR'; payload: ExhibitorProfile }
  | { type: 'REMOVE_EXHIBITOR'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<ExhibitorState['filters']> }
  | { type: 'SET_PAGINATION'; payload: Partial<ExhibitorState['pagination']> };

interface ExhibitorContextType {
  state: ExhibitorState;
  actions: {
    loadExhibitors: (params?: ExhibitorQueryParams) => Promise<void>;
    loadExhibitorStats: () => Promise<void>;
    createExhibitor: (data: CreateExhibitorDto) => Promise<ExhibitorProfile>;
    updateExhibitor: (id: string, data: UpdateExhibitorDto) => Promise<ExhibitorProfile>;
    updateExhibitorStatus: (id: string, status: string, rejectionReason?: string) => Promise<void>;
    deleteExhibitor: (id: string) => Promise<void>;
    bulkApproveExhibitors: (ids: string[]) => Promise<void>;
    bulkRejectExhibitors: (ids: string[], rejectionReason?: string) => Promise<void>;
    bulkDeleteExhibitors: (ids: string[]) => Promise<void>;
    setSelectedExhibitor: (exhibitor: ExhibitorProfile | null) => void;
    setFilters: (filters: Partial<ExhibitorState['filters']>) => void;
    setPagination: (pagination: Partial<ExhibitorState['pagination']>) => void;
  };
}

const initialState: ExhibitorState = {
  exhibitors: [],
  loading: false,
  error: null,
  selectedExhibitor: null,
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    active: 0,
    inactive: 0,
  },
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    status: undefined,
    isActive: undefined,
  },
};

const exhibitorReducer = (state: ExhibitorState, action: ExhibitorAction): ExhibitorState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_EXHIBITORS':
      return {
        ...state,
        exhibitors: action.payload.data,
        pagination: {
          current: action.payload.page,
          pageSize: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        },
      };
    case 'SET_SELECTED_EXHIBITOR':
      return { ...state, selectedExhibitor: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'UPDATE_EXHIBITOR':
      return {
        ...state,
        exhibitors: state.exhibitors.map(exhibitor =>
          exhibitor.id === action.payload.id ? action.payload : exhibitor
        ),
      };
    case 'REMOVE_EXHIBITOR':
      return {
        ...state,
        exhibitors: state.exhibitors.filter(exhibitor => exhibitor.id !== action.payload),
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    default:
      return state;
  }
};

const ExhibitorContext = createContext<ExhibitorContextType | undefined>(undefined);

export const ExhibitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(exhibitorReducer, initialState);

  const loadExhibitors = useCallback(async (params?: ExhibitorQueryParams) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const queryParams = {
        page: state.pagination.current,
        limit: state.pagination.pageSize,
        ...state.filters,
        ...params,
      };

      const response = await exhibitorService.getExhibitors(queryParams);
      dispatch({ type: 'SET_EXHIBITORS', payload: response });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load exhibitors';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      message.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.pagination.current, state.pagination.pageSize, state.filters]);

  const loadExhibitorStats = useCallback(async () => {
    try {
      const stats = await exhibitorService.getExhibitorStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load exhibitor stats';
      message.error(errorMessage);
    }
  }, []);

  const createExhibitor = useCallback(async (data: CreateExhibitorDto): Promise<ExhibitorProfile> => {
    try {
      const exhibitor = await exhibitorService.createExhibitor(data);
      message.success('Exhibitor created successfully');
      loadExhibitors(); // Refresh the list
      loadExhibitorStats(); // Refresh stats
      return exhibitor;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create exhibitor';
      message.error(errorMessage);
      throw error;
    }
  }, [loadExhibitors, loadExhibitorStats]);

  const updateExhibitor = useCallback(async (id: string, data: UpdateExhibitorDto): Promise<ExhibitorProfile> => {
    try {
      const exhibitor = await exhibitorService.updateExhibitor(id, data);
      dispatch({ type: 'UPDATE_EXHIBITOR', payload: exhibitor });
      message.success('Exhibitor updated successfully');
      return exhibitor;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update exhibitor';
      message.error(errorMessage);
      throw error;
    }
  }, []);

  const updateExhibitorStatus = useCallback(async (id: string, status: string, rejectionReason?: string) => {
    try {
      const exhibitor = await exhibitorService.updateExhibitorStatus(id, status, rejectionReason);
      dispatch({ type: 'UPDATE_EXHIBITOR', payload: exhibitor });
      message.success(`Exhibitor ${status} successfully`);
      loadExhibitorStats(); // Refresh stats
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update exhibitor status';
      message.error(errorMessage);
      throw error;
    }
  }, [loadExhibitorStats]);

  const deleteExhibitor = useCallback(async (id: string) => {
    try {
      await exhibitorService.deleteExhibitor(id);
      dispatch({ type: 'REMOVE_EXHIBITOR', payload: id });
      message.success('Exhibitor deleted successfully');
      loadExhibitorStats(); // Refresh stats
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete exhibitor';
      message.error(errorMessage);
      throw error;
    }
  }, [loadExhibitorStats]);

  const bulkApproveExhibitors = useCallback(async (ids: string[]) => {
    try {
      const result = await exhibitorService.bulkApproveExhibitors(ids);
      message.success(`${result.count} exhibitors approved successfully`);
      loadExhibitors(); // Refresh the list
      loadExhibitorStats(); // Refresh stats
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to approve exhibitors';
      message.error(errorMessage);
      throw error;
    }
  }, [loadExhibitors, loadExhibitorStats]);

  const bulkRejectExhibitors = useCallback(async (ids: string[], rejectionReason?: string) => {
    try {
      const result = await exhibitorService.bulkRejectExhibitors(ids, rejectionReason);
      message.success(`${result.count} exhibitors rejected successfully`);
      loadExhibitors(); // Refresh the list
      loadExhibitorStats(); // Refresh stats
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reject exhibitors';
      message.error(errorMessage);
      throw error;
    }
  }, [loadExhibitors, loadExhibitorStats]);

  const bulkDeleteExhibitors = useCallback(async (ids: string[]) => {
    try {
      const result = await exhibitorService.bulkDeleteExhibitors(ids);
      message.success(`${result.count} exhibitors deleted successfully`);
      loadExhibitors(); // Refresh the list
      loadExhibitorStats(); // Refresh stats
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete exhibitors';
      message.error(errorMessage);
      throw error;
    }
  }, [loadExhibitors, loadExhibitorStats]);

  const setSelectedExhibitor = useCallback((exhibitor: ExhibitorProfile | null) => {
    dispatch({ type: 'SET_SELECTED_EXHIBITOR', payload: exhibitor });
  }, []);

  const setFilters = useCallback((filters: Partial<ExhibitorState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setPagination = useCallback((pagination: Partial<ExhibitorState['pagination']>) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination });
  }, []);

  const contextValue: ExhibitorContextType = {
    state,
    actions: {
      loadExhibitors,
      loadExhibitorStats,
      createExhibitor,
      updateExhibitor,
      updateExhibitorStatus,
      deleteExhibitor,
      bulkApproveExhibitors,
      bulkRejectExhibitors,
      bulkDeleteExhibitors,
      setSelectedExhibitor,
      setFilters,
      setPagination,
    },
  };

  return (
    <ExhibitorContext.Provider value={contextValue}>
      {children}
    </ExhibitorContext.Provider>
  );
};

export const useExhibitors = (): ExhibitorContextType => {
  const context = useContext(ExhibitorContext);
  if (!context) {
    throw new Error('useExhibitors must be used within an ExhibitorProvider');
  }
  return context;
}; 