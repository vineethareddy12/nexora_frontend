import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { AuthProvider } from './features/auth/context/AuthProvider';
import { ToastProvider } from './components/toast/ToastContext';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}
