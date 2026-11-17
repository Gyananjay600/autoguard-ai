import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import VehicleListPage from './pages/vehicle/VehicleListPage';
import VehicleFormPage from './pages/vehicle/VehicleFormPage';
import VehicleDetailPage from './pages/vehicle/VehicleDetailPage';
import SensorUploadPage from './pages/sensor/SensorUploadPage';
import PredictionResultPage from './pages/prediction/PredictionResultPage';
import AdminPanelPage from './pages/admin/AdminPanelPage';
import KnowledgeFormPage from './pages/admin/KnowledgeFormPage';
import NotFoundPage from './pages/error/NotFoundPage';
import AccessDeniedPage from './pages/error/AccessDeniedPage';

import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public Landing & Showcase */}
      <Route path="/" element={<HomePage />} />

      {/* Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Fleet Operations */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute>
            <VehicleListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/new"
        element={
          <ProtectedRoute>
            <VehicleFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/:id"
        element={
          <ProtectedRoute>
            <VehicleDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/:id/edit"
        element={
          <ProtectedRoute>
            <VehicleFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sensors/upload"
        element={
          <ProtectedRoute>
            <SensorUploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/predictions/:vehicleId"
        element={
          <ProtectedRoute>
            <PredictionResultPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Only Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPanelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/knowledge/new"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <KnowledgeFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/knowledge/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <KnowledgeFormPage />
          </ProtectedRoute>
        }
      />

      {/* Error & Fallback Routes */}
      <Route path="/403" element={<AccessDeniedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
