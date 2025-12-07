// src/components/admin/ContentReports.jsx
import React, { useState, useEffect } from 'react';
import { 
    FaExclamationTriangle, 
    FaCheck, 
    FaTimes, 
    FaEye, 
    FaFilter, 
    FaSearch,
    FaFlag,
    FaTrash,
    FaUser,
    FaFileAlt,
    FaComment,
    FaExternalLinkAlt
} from 'react-icons/fa';
import { useAdminReports } from '../../hooks/useReports';
import { useAuthContext } from '../../context/AuthContext';
import './ContentReports.css';

const ContentReports = () => {
    const { user } = useAuthContext();
    const {
        reports,
        isLoading,
        error,
        pagination,
        isAdmin,
        loadReports,
        updateReportStatus,
        deleteReport
    } = useAdminReports();

    // Debug del usuario y permisos
    useEffect(() => {
        if (reports.length > 0) {
            console.log('🔍 ESTRUCTURA REPORTES:', JSON.stringify(reports[0], null, 2));
        }
    }, [reports.length]);

    // Estados para filtros
    const [filters, setFilters] = useState({
        status: 'pending',
        contentType: '',
        reason: '',
        search: ''
    });

    // Estados para vista detallada
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Cargar reportes al montar el componente
    useEffect(() => {
        if (isAdmin) {
            loadReports(filters);
        }
    }, [isAdmin, loadReports]); // Removido 'filters' para evitar loop

    // Auto-refresh cada 30 segundos si está habilitado
    useEffect(() => {
        if (!autoRefresh || !isAdmin) return;

        const interval = setInterval(() => {
            loadReports(filters);
        }, 30000); // 30 segundos

        return () => clearInterval(interval);
    }, [autoRefresh, isAdmin, loadReports, filters]);

    // Aplicar filtros
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        // Cargar reportes con nuevos filtros
        loadReports({
            page: 1,
            ...newFilters
        });
    };

    // Cambiar página
    const handlePageChange = (page) => {
        loadReports({
            page,
            ...filters
        });
    };

    // Refrescar reportes manualmente
    const handleRefresh = () => {
        loadReports(filters);
    };

    // Actualizar estado de reporte
    const handleStatusUpdate = async (reportId, newStatus, adminNotes = '') => {
        const success = await updateReportStatus(reportId, newStatus, adminNotes);
        
        if (success) {
            // Actualizar vista si el reporte estaba seleccionado
            if ((selectedReport?._id || selectedReport?.id) === reportId) {
                setSelectedReport(prev => ({ ...prev, status: newStatus, adminNotes }));
            }
            // Refrescar la lista para mostrar cambios
            handleRefresh();
        }
    };

    // Eliminar reporte
    const handleDeleteReport = async (reportId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
            const success = await deleteReport(reportId);
            
            if (success && (selectedReport?._id || selectedReport?.id) === reportId) {
                setShowDetails(false);
                setSelectedReport(null);
            }
        }
    };

    // Ver detalles del reporte
    const handleViewDetails = (report) => {
        setSelectedReport(report);
        setShowDetails(true);
    };

    // Obtener clase de estado
    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'under_review': return 'status-review';
            case 'resolved': return 'status-resolved';
            case 'dismissed': return 'status-dismissed';
            default: return 'status-pending';
        }
    };

    // Obtener texto de estado
    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'under_review': return 'En Revisión';
            case 'resolved': return 'Resuelto';
            case 'dismissed': return 'Descartado';
            default: return 'Pendiente';
        }
    };

    // Obtener icono de tipo de contenido
    const getContentIcon = (contentType) => {
        switch (contentType) {
            case 'post': return <FaFileAlt />;
            case 'comment': return <FaComment />;
            case 'guide': return <FaFileAlt />;
            case 'user': return <FaUser />;
            default: return <FaFileAlt />;
        }
    };

    // Obtener título de contenido basado en tipo e ID
    const getContentTitle = (report) => {
        // Prioridad 1: Título directo del reporte
        if (report.content_title || report.contentTitle || report.title) {
            return report.content_title || report.contentTitle || report.title;
        }
        
        // Prioridad 2: Título del objeto content anidado
        if (report.content && report.content.title) {
            return report.content.title;
        }
        
        // Prioridad 3: Generar título descriptivo basado en tipo e ID
        const contentType = report.content_type || report.contentType;
        const contentId = report.content_id || report.contentId;
        
        if (contentType === 'post') {
            return contentId ? `Post #${contentId}` : 'Publicación sin identificar';
        } else if (contentType === 'guide') {
            return contentId ? `Guía #${contentId}` : 'Guía sin identificar';
        } else if (contentType === 'comment') {
            return contentId ? `Comentario #${contentId}` : 'Comentario sin identificar';
        } else {
            return 'Contenido reportado';
        }
    };

    // Obtener información adicional para el tooltip
    const getContentInfo = (report) => {
        const contentType = report.content_type || report.contentType;
        const contentId = report.content_id || report.contentId;
        const description = report.description || report.report_description;
        
        return {
            type: contentType,
            id: contentId,
            description: description || 'Sin descripción adicional',
            title: getContentTitle(report)
        };
    };

    // Navegar al contenido reportado
    const handleViewContent = (report) => {
        const contentType = report.content_type || report.contentType;
        const contentId = report.content_id || report.contentId;
        
        if (!contentId) {
            alert('No se puede acceder al contenido: ID no disponible');
            return;
        }

        let path;
        switch (contentType) {
            case 'post':
                path = `/posts/${contentId}`;
                break;
            case 'guide':
                path = `/guides/${contentId}`;
                break;
            case 'comment':
                // Los comentarios también están en comunidad.
                path = `/community#comment-${contentId}`;
                break;
            case 'user':
                 // Añadido para perfiles de usuario
                path = `/profile/${contentId}`;
                break;
            default:
                alert(`Tipo de contenido no reconocido para navegación: ${contentType}`);
                return;
        }

        if (path) {
            window.open(path, '_blank');
        }
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.log('🚨 Error formateando fecha:', dateString);
            return 'Fecha inválida';
        }
    };

    if (!isAdmin) {
        return (
            <div className="admin-access-denied">
                <FaExclamationTriangle />
                <h2>Acceso Denegado</h2>
                <p>No tienes permisos para acceder a esta sección.</p>
            </div>
        );
    }

  return (
    <div className="content-reports">
      <div className="reports-header">
        <h1>
          <FaFlag /> Gestión de Reportes
        </h1>
        <div className="header-actions">
          <div className="auto-refresh-toggle">
            <label>
              <input 
                type="checkbox" 
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span>Auto-refresh (30s)</span>
            </label>
          </div>
          <button 
            className="btn-refresh" 
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refrescar reportes"
          >
            {isLoading ? (
              <div className="spinner-small"></div>
            ) : (
              <>🔄 Refrescar</>
            )}
          </button>
          <div className="reports-stats">
            <div className="stat-card">
              <span className="stat-number">{pagination.totalReports}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="reports-filters">
        <div className="filter-group">
          <label>
            <FaFilter /> Estado:
          </label>
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="under_review">En Revisión</option>
            <option value="resolved">Resueltos</option>
            <option value="dismissed">Descartados</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Tipo:</label>
          <select 
            value={filters.contentType} 
            onChange={(e) => handleFilterChange('contentType', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="post">Publicaciones</option>
            <option value="guide">Guías</option>
            <option value="comment">Comentarios</option>
            <option value="user">Usuarios</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Razón:</label>
          <select 
            value={filters.reason} 
            onChange={(e) => handleFilterChange('reason', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="spam">Spam</option>
            <option value="harassment">Acoso</option>
            <option value="inappropriate">Inapropiado</option>
            <option value="offensive">Ofensivo</option>
            <option value="misinformation">Información falsa</option>
            <option value="copyright">Derechos de autor</option>
            <option value="violence">Violencia</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <label>
            <FaSearch /> Buscar:
          </label>
          <input
            type="text"
            placeholder="Buscar en reportes..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Lista de reportes */}
      <div className="reports-content">
        {error && (
          <div className={`error-message ${error.includes('desarrollo') ? 'warning-message' : ''}`}>
            {error.includes('desarrollo') ? (
              <FaExclamationTriangle style={{ color: '#f59e0b' }} />
            ) : (
              <FaExclamationTriangle style={{ color: '#ef4444' }} />
            )}
            <div className="error-content">
              <h4>{error.includes('desarrollo') ? 'Panel en Desarrollo' : 'Error'}</h4>
              <p>{error}</p>
              {error.includes('desarrollo') && (
                <p className="error-note">
                  Los reportes se están creando correctamente, pero la interfaz de administración requiere endpoints adicionales del backend.
                </p>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando reportes...</p>
          </div>
        ) : (
          <div className="reports-table">
            <div className="table-header">
              <div className="header-cell">Contenido</div>
              <div className="header-cell">Reportado por</div>
              <div className="header-cell">Razón</div>
              <div className="header-cell">Estado</div>
              <div className="header-cell">Fecha</div>
              <div className="header-cell">Acciones</div>
            </div>

            {reports.length === 0 ? (
              <div className="no-reports">
                <FaFlag />
                <p>No se encontraron reportes con los filtros seleccionados.</p>
              </div>
            ) : (
              reports.map(report => (
                <div key={report.id || report._id} className="table-row">
                  <div className="cell content-cell">
                    <div className="content-info">
                      {getContentIcon(report.content_type || report.contentType)}
                      <div>
                        <span className="content-title" title={`ID: ${report.content_id || 'N/A'} - ${report.description || 'Sin descripción'}`}>
                          {getContentTitle(report)}
                        </span>
                        <span className="content-type">
                          {report.content_type || report.contentType || 'N/A'}
                          {report.content_id && <span className="content-id"> (ID: {report.content_id})</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="cell">
                    <div className="user-info">
                      <span className="username">
                        {report.reporter?.alias || report.reportedBy?.alias || 
                         report.reporter?.username || report.reportedBy?.username ||
                         report.user?.alias || report.user?.username || 'Usuario desconocido'}
                      </span>
                    </div>
                  </div>

                  <div className="cell">
                    <span className="reason-tag">
                      {(report.reason || report.reportReason) && typeof (report.reason || report.reportReason) === 'string' ? 
                        (report.reason || report.reportReason).charAt(0).toUpperCase() + (report.reason || report.reportReason).slice(1) : 
                        'No especificada'
                      }
                    </span>
                  </div>

                  <div className="cell">
                    <span className={`status-badge ${getStatusClass(report.status)}`}>
                      {getStatusText(report.status || 'pending')}
                    </span>
                  </div>

                  <div className="cell">
                    <span className="date-text">
                      {formatDate(report.created_at || report.createdAt)}
                    </span>
                  </div>

                  <div className="cell actions-cell">
                    <button
                      className="action-btn content-btn"
                      onClick={() => handleViewContent(report)}
                      title="Ver contenido reportado"
                      disabled={!report.content_id && !report.contentId}
                    >
                      <FaExternalLinkAlt />
                    </button>

                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewDetails(report)}
                      title="Ver detalles del reporte"
                    >
                      <FaEye />
                    </button>

                    {(report.status === 'pending' || !report.status) && (
                      <>
                        <button
                          className="action-btn approve-btn"
                          onClick={() => handleStatusUpdate(report.id || report._id, 'resolved')}
                          title="Marcar como resuelto"
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="action-btn dismiss-btn"
                          onClick={() => handleStatusUpdate(report.id || report._id, 'dismissed')}
                          title="Descartar"
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}

                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteReport(report.id || report._id)}
                      title="Eliminar reporte"
                    >
                      <FaTrash />
                    </button>


                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${pagination.page === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetails && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del Reporte</h3>
              <button
                className="close-btn"
                onClick={() => setShowDetails(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="report-detail-section">
                <h4>Información del Contenido</h4>
                <p><strong>Tipo:</strong> {selectedReport.content_type || selectedReport.contentType}</p>
                <p><strong>Título:</strong> {getContentTitle(selectedReport)}</p>
                <p><strong>ID del Contenido:</strong> {selectedReport.content_id || selectedReport.contentId}</p>
                
                {(selectedReport.content_id || selectedReport.contentId) && (
                  <div className="content-actions">
                    <button
                      className="btn-view-content"
                      onClick={() => handleViewContent(selectedReport)}
                    >
                      <FaExternalLinkAlt /> Ver Contenido Reportado
                    </button>
                  </div>
                )}
              </div>

              <div className="report-detail-section">
                <h4>Información del Reporte</h4>
                <p><strong>Reportado por:</strong> {
                  selectedReport.reporter?.alias || selectedReport.reportedBy?.alias || 
                  selectedReport.reporter?.username || selectedReport.reportedBy?.username ||
                  'Usuario desconocido'
                }</p>
                <p><strong>Razón:</strong> {
                  (selectedReport.reason || selectedReport.reportReason) ? 
                  (selectedReport.reason || selectedReport.reportReason).charAt(0).toUpperCase() + (selectedReport.reason || selectedReport.reportReason).slice(1) :
                  'No especificada'
                }</p>
                <p><strong>Descripción:</strong> {selectedReport.description || selectedReport.report_description || 'Sin descripción adicional'}</p>
                <p><strong>Fecha del Reporte:</strong> {formatDate(selectedReport.created_at || selectedReport.createdAt)}</p>
                <p><strong>Estado Actual:</strong> 
                  <span className={`status-badge ${getStatusClass(selectedReport.status || 'pending')}`}>
                    {getStatusText(selectedReport.status || 'pending')}
                  </span>
                </p>
              </div>

              {(selectedReport.admin_notes || selectedReport.adminNotes) && (
                <div className="report-detail-section">
                  <h4>Notas del Administrador</h4>
                  <p>{selectedReport.admin_notes || selectedReport.adminNotes}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedReport.status === 'pending' && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      handleStatusUpdate(selectedReport.id || selectedReport._id, 'resolved');
                      setShowDetails(false);
                    }}
                  >
                    <FaCheck /> Resolver
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => {
                      handleStatusUpdate(selectedReport.id || selectedReport._id, 'dismissed');
                      setShowDetails(false);
                    }}
                  >
                    <FaTimes /> Descartar
                  </button>
                </>
              )}
              <button
                className="btn btn-danger"
                onClick={() => {
                  handleDeleteReport(selectedReport.id || selectedReport._id);
                  setShowDetails(false);
                }}
              >
                <FaTrash /> Eliminar
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentReports;