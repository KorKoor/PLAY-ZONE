// src/components/admin/DashboardOverview.jsx
import React from 'react';
import { FaUsers, FaGamepad, FaExclamationTriangle, FaComments, FaBook, FaChartLine } from 'react-icons/fa';
import './DashboardOverview.css';

const DashboardOverview = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  const defaultStats = {
    totalUsers: 0,
    totalGames: 0,
    pendingReports: 0,
    totalPosts: 0,
    totalGuides: 0,
    activeUsers: 0,
    ...stats
  };

  const statCards = [
    {
      title: 'Usuarios Totales',
      value: defaultStats.totalUsers,
      icon: FaUsers,
      color: 'primary',
      trend: defaultStats.usersTrend || 0
    },
    {
      title: 'Juegos en Catálogo',
      value: defaultStats.totalGames,
      icon: FaGamepad,
      color: 'success',
      trend: defaultStats.gamesTrend || 0
    },
    {
      title: 'Reportes Pendientes',
      value: defaultStats.pendingReports,
      icon: FaExclamationTriangle,
      color: 'warning',
      urgent: defaultStats.pendingReports > 5
    },
    {
      title: 'Publicaciones',
      value: defaultStats.totalPosts,
      icon: FaComments,
      color: 'info',
      trend: defaultStats.postsTrend || 0
    },
    {
      title: 'Guías Publicadas',
      value: defaultStats.totalGuides,
      icon: FaBook,
      color: 'secondary',
      trend: defaultStats.guidesTrend || 0
    },
    {
      title: 'Usuarios Activos',
      value: defaultStats.activeUsers,
      icon: FaChartLine,
      color: 'primary',
      trend: defaultStats.activeTrend || 0
    }
  ];

  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`stat-card ${stat.color} ${stat.urgent ? 'urgent' : ''}`}
            >
              <div className="stat-header">
                <div className="stat-icon">
                  <Icon />
                </div>
                <div className="stat-info">
                  <h3 className="stat-title">{stat.title}</h3>
                  <p className="stat-value">{stat.value.toLocaleString()}</p>
                </div>
              </div>
              
              {stat.trend !== undefined && (
                <div className={`stat-trend ${stat.trend >= 0 ? 'positive' : 'negative'}`}>
                  {stat.trend >= 0 ? '↗' : '↘'} {Math.abs(stat.trend)}% este mes
                </div>
              )}
              
              {stat.urgent && (
                <div className="urgent-badge">
                  ¡Requiere atención!
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="dashboard-actions">
        <div className="action-section">
          <h3>Acciones Rápidas</h3>
          <div className="quick-actions">
            <button className="action-btn primary">
              <FaUsers /> Ver Usuarios
            </button>
            <button className="action-btn warning">
              <FaExclamationTriangle /> Revisar Reportes
            </button>
            <button className="action-btn success">
              <FaGamepad /> Gestionar Catálogo
            </button>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Actividad Reciente</h3>
          <div className="activity-list">
            {defaultStats.recentActivity?.length > 0 ? (
              defaultStats.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-time">{activity.time}</div>
                  <div className="activity-description">{activity.description}</div>
                </div>
              ))
            ) : (
              <p className="no-activity">No hay actividad reciente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;