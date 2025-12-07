// src/hooks/useReports.js

import { useState, useCallback } from 'react';
import reportService from '../services/reportService';
import { useAuthContext } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar reportes de contenido
 */
export const useReports = () => {
  const { user } = useAuthContext();
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  /**
   * Enviar un reporte
   */
  const submitReport = useCallback(async (reportData) => {
    if (!user) {
      setReportError('Debes iniciar sesión para reportar contenido');
      return false;
    }

    setIsSubmittingReport(true);
    setReportError(null);
    setReportSuccess(false);

    try {
      await reportService.createReport(reportData);
      setReportSuccess(true);
      return true;
    } catch (error) {
      console.error('Error enviando reporte:', error);
      setReportError(error.message || 'Error al enviar el reporte');
      return false;
    } finally {
      setIsSubmittingReport(false);
    }
  }, [user]);

  /**
   * Verificar si se puede reportar contenido específico
   */
  const checkCanReport = useCallback(async (contentId, contentType) => {
    if (!user) return { canReport: false, reason: 'Debes iniciar sesión' };

    try {
      const response = await reportService.canReportContent(contentId, contentType);
      return {
        canReport: response.can_report,
        reason: response.reason
      };
    } catch (error) {
      console.error('Error verificando capacidad de reporte:', error);
      // En caso de error, permitir el reporte
      return { canReport: true, reason: null };
    }
  }, [user]);

  /**
   * Obtener razones de reporte predefinidas
   */
  const getReportReasons = useCallback(() => {
    return reportService.getReportReasons();
  }, []);

  /**
   * Limpiar estado de reporte
   */
  const clearReportState = useCallback(() => {
    setReportError(null);
    setReportSuccess(false);
    setIsSubmittingReport(false);
  }, []);

  return {
    // Estados
    isSubmittingReport,
    reportError,
    reportSuccess,

    // Funciones
    submitReport,
    checkCanReport,
    getReportReasons,
    clearReportState
  };
};

/**
 * Hook para gestión de reportes de administrador
 */
export const useAdminReports = () => {
  const { user } = useAuthContext();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalReports: 0
  });

  /**
   * Verificar si el usuario es administrador
   */
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  /**
   * Cargar reportes para administrador
   */
  const loadReports = useCallback(async (params = {}) => {
    if (!isAdmin) {
      setError('No tienes permisos de administrador');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await reportService.getAllReports(params);
      
      const reportsList = response.data?.reports || response.reports || [];
      const paginationData = response.data?.pagination || response.pagination || {};
      
      setReports(reportsList);
      setPagination(prev => ({
        ...prev,
        page: paginationData.current_page || response.page || 1,
        totalPages: paginationData.total_pages || response.totalPages || 1,
        totalReports: paginationData.total_reports || response.totalReports || reportsList.length
      }));
      
    } catch (error) {
      console.error('Error cargando reportes:', error);
      setError(error.message || 'Error al cargar reportes');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  /**
   * Actualizar estado de un reporte
   */
  const updateReportStatus = useCallback(async (reportId, status, adminNotes = '', action = null) => {
    if (!isAdmin) {
      setError('No tienes permisos de administrador');
      return false;
    }

    try {
      const updatedReport = await reportService.updateReportStatus(reportId, status, adminNotes, action);
      
      // Actualizar el reporte en la lista local
      setReports(prev => prev.map(report => 
        (report._id || report.id) === reportId ? { ...report, ...updatedReport } : report
      ));

      return true;
    } catch (error) {
      console.error('Error actualizando reporte:', error);
      setError(error.message || 'Error al actualizar reporte');
      return false;
    }
  }, [isAdmin]);

  /**
   * Obtener estadísticas de reportes
   */
  const loadReportStats = useCallback(async () => {
    if (!isAdmin) {
      setError('No tienes permisos de administrador');
      return null;
    }

    try {
      const stats = await reportService.getReportStats();
      return stats;
    } catch (error) {
      console.error('Error cargando estadísticas de reportes:', error);
      setError(error.message || 'Error al cargar estadísticas');
      return null;
    }
  }, [isAdmin]);

  /**
   * Eliminar un reporte
   */
  const deleteReport = useCallback(async (reportId) => {
    if (!isAdmin) {
      setError('No tienes permisos de administrador');
      return false;
    }

    try {
      await reportService.deleteReport(reportId);
      
      // Remover el reporte de la lista local
      setReports(prev => prev.filter(report => (report._id || report.id) !== reportId));
      
      return true;
    } catch (error) {
      console.error('Error eliminando reporte:', error);
      setError(error.message || 'Error al eliminar reporte');
      return false;
    }
  }, [isAdmin]);

  return {
    // Estados
    reports,
    isLoading,
    error,
    pagination,
    isAdmin,

    // Funciones
    loadReports,
    updateReportStatus,
    loadReportStats,
    deleteReport
  };
};

export default useReports;