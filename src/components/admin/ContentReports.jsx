// src/components/admin/ContentReports.jsx
import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheck, FaTimes, FaEye, FaFilter, FaSearch } from 'react-icons/fa';
import adminService from '../../services/adminService';
import './ContentReports.css';

const ContentReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ type: 'all', status: 'pending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await adminService.getReports(filter.type, filter.status);
      setReports(Array.isArray(response?.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los reportes');
      setReports([]); // Asegurar que reports sea siempre un array
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReport = async (reportId) => {
    try {
      await adminService.approveReport(reportId);
      setReports((prevReports) => {
        const reportsArray = Array.isArray(prevReports) ? prevReports : [];
        return reportsArray.map(report => 
          report._id === reportId 
            ? { ...report, status: 'approved', resolvedAt: new Date() }
            : report
        );
      });
    } catch (err) {
      console.error('Error approving report:', err);
      alert('Error al aprobar el reporte');
    }
  };

  const handleRejectReport = async (reportId, reason = '') => {
    try {
      await adminService.rejectReport(reportId, reason);
      setReports((prevReports) => {
        const reportsArray = Array.isArray(prevReports) ? prevReports : [];
        return reportsArray.map(report => 
          report._id === reportId 
            ? { ...report, status: 'rejected', resolvedAt: new Date(), rejectReason: reason }
            : report
        );
      });
    } catch (err) {
      console.error('Error rejecting report:', err);
      alert('Error al rechazar el reporte');
    }
  };

  const getReportTypeLabel = (type) => {
    const types = {
      post: 'Publicación',
      guide: 'Guía',
      comment: 'Comentario',
      user: 'Usuario'
    };
    return types[type] || type;
  };

  const getReasonLabel = (reason) => {
    const reasons = {
      spam: 'Spam',
      inappropriate: 'Contenido inapropiado',
      harassment: 'Acoso',
      copyright: 'Violación de derechos de autor',
      other: 'Otro'
    };
    return reasons[reason] || reason;
  };

  const filteredReports = (Array.isArray(reports) ? reports : []).filter(report => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        report.content?.title?.toLowerCase().includes(search) ||
        report.content?.content?.toLowerCase().includes(search) ||
        report.reportedBy?.alias?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="content-reports">
      <div className="reports-header">
        <h2>Gestión de Reportes de Contenido</h2>
        <p>Revisa y modera el contenido reportado por los usuarios</p>
      </div>

      <div className="reports-controls">
        <div className="search-filter-section">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Buscar en reportes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="filter-select"
            >
              <option value="all">Todos los tipos</option>
              <option value="post">Publicaciones</option>
              <option value="guide">Guías</option>
              <option value="comment">Comentarios</option>
              <option value="user">Usuarios</option>
            </select>

            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="filter-select"
            >
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
              <option value="all">Todos</option>
            </select>
          </div>
        </div>

        <div className="reports-stats">
          <div className="stat-item pending">
            <span className="stat-number">{(Array.isArray(reports) ? reports : []).filter(r => r.status === 'pending').length}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat-item approved">
            <span className="stat-number">{(Array.isArray(reports) ? reports : []).filter(r => r.status === 'approved').length}</span>
            <span className="stat-label">Aprobados</span>
          </div>
          <div className="stat-item rejected">
            <span className="stat-number">{(Array.isArray(reports) ? reports : []).filter(r => r.status === 'rejected').length}</span>
            <span className="stat-label">Rechazados</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando reportes...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="reports-list">
          {filteredReports.length === 0 ? (
            <div className="no-reports">
              <FaExclamationTriangle />
              <h3>No hay reportes</h3>
              <p>No se encontraron reportes que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            filteredReports.map(report => (
              <div key={report._id} className={`report-card ${report.status}`}>
                <div className="report-header">
                  <div className="report-type">
                    <span className="type-badge">{getReportTypeLabel(report.contentType)}</span>
                    <span className={`status-badge ${report.status}`}>{report.status}</span>
                  </div>
                  <div className="report-date">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="report-content">
                  <div className="content-preview">
                    <h4>{report.content?.title || 'Sin título'}</h4>
                    <p className="content-text">
                      {report.content?.content?.substring(0, 150) || 'Sin contenido'}
                      {report.content?.content?.length > 150 && '...'}
                    </p>
                  </div>

                  <div className="report-details">
                    <div className="report-reason">
                      <strong>Motivo:</strong> {getReasonLabel(report.reason)}
                    </div>
                    <div className="reporter-info">
                      <strong>Reportado por:</strong> @{report.reportedBy?.alias || 'Usuario desconocido'}
                    </div>
                    {report.description && (
                      <div className="report-description">
                        <strong>Descripción:</strong> {report.description}
                      </div>
                    )}
                  </div>
                </div>

                {report.status === 'pending' && (
                  <div className="report-actions">
                    <button
                      className="action-btn view"
                      onClick={() => setSelectedReport(report)}
                    >
                      <FaEye /> Ver Completo
                    </button>
                    <button
                      className="action-btn approve"
                      onClick={() => handleApproveReport(report._id)}
                    >
                      <FaCheck /> Aprobar
                    </button>
                    <button
                      className="action-btn reject"
                      onClick={() => {
                        const reason = prompt('Razón para rechazar el reporte (opcional):');
                        if (reason !== null) {
                          handleRejectReport(report._id, reason);
                        }
                      }}
                    >
                      <FaTimes /> Rechazar
                    </button>
                  </div>
                )}

                {report.resolvedAt && (
                  <div className="resolution-info">
                    Resuelto el {new Date(report.resolvedAt).toLocaleDateString()}
                    {report.rejectReason && (
                      <span className="reject-reason"> - Motivo: {report.rejectReason}</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle del Reporte</h3>
              <button onClick={() => setSelectedReport(null)}>×</button>
            </div>
            <div className="modal-content">
              <div className="full-content">
                <h4>{selectedReport.content?.title}</h4>
                <p>{selectedReport.content?.content}</p>
              </div>
              <div className="report-meta">
                <p><strong>Tipo:</strong> {getReportTypeLabel(selectedReport.contentType)}</p>
                <p><strong>Motivo:</strong> {getReasonLabel(selectedReport.reason)}</p>
                <p><strong>Reportado por:</strong> @{selectedReport.reportedBy?.alias}</p>
                <p><strong>Fecha:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="action-btn approve"
                onClick={() => {
                  handleApproveReport(selectedReport._id);
                  setSelectedReport(null);
                }}
              >
                <FaCheck /> Aprobar
              </button>
              <button
                className="action-btn reject"
                onClick={() => {
                  const reason = prompt('Razón para rechazar:');
                  if (reason !== null) {
                    handleRejectReport(selectedReport._id, reason);
                    setSelectedReport(null);
                  }
                }}
              >
                <FaTimes /> Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentReports;