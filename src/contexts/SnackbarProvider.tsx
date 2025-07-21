'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Alert, AlertProps, Slide, SlideProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Snackbar message interface
export interface SnackbarMessage {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: ReactNode;
}

// Context interface
interface SnackbarContextType {
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'warning' | 'info', duration?: number, action?: ReactNode) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hideSnackbar: () => void;
}

// Create context
const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// Slide transition component
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

// Provider component
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);
  const [currentSnackbar, setCurrentSnackbar] = useState<SnackbarMessage | null>(null);

  // Show snackbar function
  const showSnackbar = useCallback((
    message: string, 
    severity: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 6000,
    action?: ReactNode
  ) => {
    const id = Date.now().toString();
    const newSnackbar: SnackbarMessage = {
      id,
      message,
      severity,
      duration,
      action
    };

    setSnackbars(prev => [...prev, newSnackbar]);
    
    // If no snackbar is currently showing, show this one immediately
    if (!currentSnackbar) {
      setCurrentSnackbar(newSnackbar);
    }
  }, [currentSnackbar]);

  // Convenience methods
  const showSuccess = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'success', duration);
  }, [showSnackbar]);

  const showError = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'error', duration || 8000); // Errors show longer by default
  }, [showSnackbar]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'warning', duration);
  }, [showSnackbar]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showSnackbar(message, 'info', duration);
  }, [showSnackbar]);

  // Hide current snackbar and show next one in queue
  const hideSnackbar = useCallback(() => {
    if (currentSnackbar) {
      setSnackbars(prev => prev.filter(snackbar => snackbar.id !== currentSnackbar.id));
      setCurrentSnackbar(null);
    }
  }, [currentSnackbar]);

  // Handle snackbar close
  const handleClose = useCallback((event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    hideSnackbar();
  }, [hideSnackbar]);

  // Show next snackbar when current one is hidden
  React.useEffect(() => {
    if (!currentSnackbar && snackbars.length > 0) {
      setCurrentSnackbar(snackbars[0]);
    }
  }, [currentSnackbar, snackbars]);

  const contextValue: SnackbarContextType = {
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideSnackbar,
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      
      {/* Snackbar Component */}
      {currentSnackbar && (
        <Snackbar
          open={!!currentSnackbar}
          autoHideDuration={currentSnackbar?.duration || 6000}
          onClose={handleClose}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              borderRadius: 2,
            }
          }}
        >
          <Alert
            onClose={handleClose}
            severity={currentSnackbar.severity}
            variant="filled"
            action={currentSnackbar.action}
            sx={{
              width: '100%',
              borderRadius: 2,
              fontWeight: 500,
              '& .MuiAlert-icon': {
                fontSize: '1.25rem',
              },
              '& .MuiAlert-message': {
                fontSize: '0.875rem',
                lineHeight: 1.4,
              },
              ...(currentSnackbar.severity === 'success' && {
                backgroundColor: theme.palette.primary.main,
                color: '#fff',
                '& .MuiAlert-icon': {
                  color: '#fff',
                },
                '& .MuiIconButton-root': {
                  color: '#fff',
                },
              }),
            }}
          >
            {currentSnackbar.message}
          </Alert>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  );
}

// Custom hook to use snackbar
export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
} 