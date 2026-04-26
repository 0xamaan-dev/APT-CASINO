"use client";

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { NotificationProvider } from '@/components/NotificationSystem';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// WalletProviders loaded client-side only — prevents SSR crash from initiaPrivyWalletConnector
const WalletProviders = dynamic(
  () => import('@/components/WalletProviders'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0A0008 0%, #1A0015 100%)',
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    ),
  }
);

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8B2398' },
    secondary: { main: '#31C4BE' },
    background: {
      default: 'rgba(10, 0, 8, 0.98)',
      paper: 'rgba(10, 0, 8, 0.98)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.9)',
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(10, 0, 8, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(10, 0, 8, 0.98) 0%, rgba(26, 0, 21, 0.98) 100%)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(148, 163, 184, 0.3)',
          background: 'linear-gradient(135deg, rgba(139, 35, 152, 0.1) 0%, rgba(49, 196, 190, 0.1) 100%)',
        },
      },
    },
    MuiDialogContent: { styleOverrides: { root: { color: '#FFFFFF' } } },
    MuiDialogActions: { styleOverrides: { root: { color: '#FFFFFF' } } },
  },
});

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <NotificationProvider>
          <WalletProviders>
            {children}
          </WalletProviders>
        </NotificationProvider>
      </MuiThemeProvider>
    </Provider>
  );
}
