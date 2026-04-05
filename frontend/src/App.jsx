import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import InboxPage from './pages/InboxPage';
import SentPage from './pages/SentPage';
import ComposePage from './pages/ComposePage';
import EmailDetailPage from './pages/EmailDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/sent" element={<SentPage />} />
            <Route path="/compose" element={<ComposePage />} />
            <Route path="/email/:id" element={<EmailDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
