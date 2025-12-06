// src/components/admin/AdminNavigation.jsx
import React from 'react';
import { FaTachometerAlt, FaExclamationTriangle, FaUsers, FaGamepad } from 'react-icons/fa';
import './AdminNavigation.css';

const AdminNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: FaTachometerAlt },
    { id: 'reports', label: 'Reportes', icon: FaExclamationTriangle },
    { id: 'users', label: 'Usuarios', icon: FaUsers },
    { id: 'catalog', label: 'Catálogo', icon: FaGamepad }
  ];

  return (
    <nav className="admin-navigation">
      <div className="nav-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="nav-tab-icon" />
              <span className="nav-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminNavigation;