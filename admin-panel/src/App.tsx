import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { App as AntdApp } from 'antd'
import { AuthProvider } from './hooks/useAuth'
import { ExhibitorProvider } from './hooks/useExhibitors'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from '@layouts/MainLayout'
import LoginPage from '@pages/Login'
import Dashboard from '@pages/Dashboard'
import Exhibition from '@pages/Exhibition'
import CreateExhibition from '@pages/Exhibition/create'
import EditExhibition from '@pages/Exhibition/edit'
import ViewExhibition from '@pages/Exhibition/view'
import ExhibitionLayoutPage from '@pages/Exhibition/layout'
import Users from '@pages/Users'
import Settings from '@pages/Settings'
import StallTypes from '@pages/stall/type'
import StallList from '@pages/stall/list'
import BookingsPage from '@pages/booking'
import CreateBookingPage from '@pages/booking/create'
import ExhibitorsPage from '@pages/exhibitors'

const AppContent: React.FC = () => {
  return (
    <AuthProvider>
      <ExhibitorProvider>
        <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="exhibitions" element={<Exhibition />} />
          <Route path="exhibitions/create" element={
            <ProtectedRoute requiredPermission="exhibitions:create">
              <CreateExhibition />
            </ProtectedRoute>
          } />
          <Route path="exhibitions/:id/edit" element={
            <ProtectedRoute requiredPermission="exhibitions:edit">
              <EditExhibition />
            </ProtectedRoute>
          } />
          <Route path="exhibitions/:id/layout" element={
            <ProtectedRoute requiredPermission="exhibitions:edit">
              <ExhibitionLayoutPage />
            </ProtectedRoute>
          } />
          <Route path="exhibitions/:id" element={<ViewExhibition />} />
          <Route path="stalls/list" element={
            <ProtectedRoute>
              <StallList />
            </ProtectedRoute>
          } />
          <Route path="stalls/types" element={
            <ProtectedRoute>
              <StallTypes />
            </ProtectedRoute>
          } />
          <Route path="bookings" element={
            <ProtectedRoute requiredPermission="bookings_view">
              <BookingsPage />
            </ProtectedRoute>
          } />
          <Route path="bookings/create" element={
            <ProtectedRoute requiredPermission="bookings_create">
              <CreateBookingPage />
            </ProtectedRoute>
          } />
          <Route path="exhibitors" element={
            <ProtectedRoute requiredPermission="exhibitors_view">
              <ExhibitorsPage />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute requiredPermission="users:read">
              <Users />
            </ProtectedRoute>
          } />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all route - redirect to dashboard or login */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </ExhibitorProvider>
    </AuthProvider>
  )
}

const App: React.FC = () => {
  return (
    <AntdApp>
      <AppContent />
    </AntdApp>
  )
}

export default App 