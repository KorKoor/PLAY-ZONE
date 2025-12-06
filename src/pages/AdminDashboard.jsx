import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import adminService from '../services/adminService';
import AdminNavigation from '../components/admin/AdminNavigation';
import DashboardOverview from '../components/admin/DashboardOverview';
import ContentReports from '../components/admin/ContentReports';
import UserManagement from '../components/admin/UserManagement';
import GameCatalogManager from '../components/admin/GameCatalogManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsResponse = await adminService.getDashboardStats();
        setStats(statsResponse.data);
        setError(null);
      } catch (err) {
        setError('No se pudieron cargar las estadísticas del dashboard.');
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview stats={stats} loading={loading} />;
      case 'reports':
        return <ContentReports />;
      case 'users':
        return <UserManagement />;
      case 'catalog':
        return <GameCatalogManager />;
      default:
        return <DashboardOverview stats={stats} loading={loading} />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-welcome">
          <h1>Panel de Administración</h1>
          <p>¡Bienvenido, {user?.alias || user?.name}!</p>
        </div>
      </div>

      <AdminNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="admin-content">
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}
        
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;