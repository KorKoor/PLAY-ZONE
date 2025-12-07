// src/services/reportService.js

import { post, get, put, del } from './httpService';

const API_URL = '/reports';

/**
 * Servicio para gestionar reportes de contenido
 */
class ReportService {
  /**
   * Crear un nuevo reporte
   * @param {Object} reportData - Datos del reporte
   * @param {string} reportData.contentId - ID del contenido reportado
   * @param {string} reportData.contentType - Tipo de contenido (post, guide, user, etc.)
   * @param {string} reportData.reason - Razón del reporte
   * @param {string} reportData.description - Descripción detallada (opcional)
   * @param {string} reportData.reportedUserId - ID del usuario reportado (opcional)
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async createReport(reportData) {
    try {
      // NOTA: El endpoint /api/v1/reports necesita ser implementado en el backend
      const response = await post(API_URL, {
        content_id: reportData.contentId,
        content_type: reportData.contentType,
        reason: reportData.reason,
        description: reportData.description || '',
        reported_user_id: reportData.reportedUserId || null,
        additional_info: {
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href
        }
      });

      return response;
    } catch (error) {
      console.error('Error creando reporte:', error);
      
      // Manejar diferentes tipos de errores
      if (error.status === 429) {
        throw new Error('Has enviado demasiados reportes recientemente. Por favor, espera un momento antes de reportar nuevamente.');
      } else if (error.status === 400) {
        throw new Error('Los datos del reporte no son válidos. Por favor, revisa la información.');
      } else if (error.status === 401) {
        throw new Error('Debes iniciar sesión para reportar contenido.');
      } else if (error.status === 403) {
        throw new Error('No tienes permisos para reportar este contenido.');
      } else if (error.status === 404 || error.message.includes('404')) {
        // El endpoint no está implementado en el backend
        console.warn('🚨 BACKEND: El endpoint /api/v1/reports necesita ser implementado');
        throw new Error('⚠️ El sistema de reportes está en desarrollo. Por favor, contacta al administrador si encuentras contenido inapropiado.');
      } else if (error.status === 409) {
        throw new Error('Ya has reportado este contenido anteriormente.');
      } else {
        throw new Error('Error al enviar el reporte. Por favor, intenta nuevamente.');
      }
    }
  }

  /**
   * Obtener reportes del usuario actual
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Página actual
   * @param {number} params.limit - Elementos por página
   * @param {string} params.status - Estado del reporte (pending, reviewed, resolved)
   * @returns {Promise<Object>} Lista de reportes del usuario
   */
  async getMyReports(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.status && { status: params.status })
      });

      const response = await get(`${API_URL}/my-reports?${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error obteniendo reportes del usuario:', error);
      throw new Error('Error al cargar tus reportes.');
    }
  }

  /**
   * Obtener estadísticas de reportes (solo para admins)
   * @returns {Promise<Object>} Estadísticas de reportes
   */
  async getReportStats() {
    try {
      const response = await get(`${API_URL}/stats`);
      return response;
    } catch (error) {
      console.error('Error obteniendo estadísticas de reportes:', error);
      throw new Error('Error al cargar estadísticas de reportes.');
    }
  }

  /**
   * Obtener todos los reportes (solo para admins)
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Página actual
   * @param {number} params.limit - Elementos por página
   * @param {string} params.status - Estado del reporte
   * @param {string} params.contentType - Tipo de contenido
   * @param {string} params.reason - Razón del reporte
   * @param {string} params.sortBy - Campo para ordenar
   * @param {string} params.sortOrder - Orden (asc, desc)
   * @returns {Promise<Object>} Lista de todos los reportes
   */
  async getAllReports(params = {}) {
    try {
      // TEMPORAL: Datos mock para desarrollo y debugging
      if (process.env.NODE_ENV === 'development' && window.location.search.includes('mock=true')) {
        console.log('🚧 Usando datos mock para testing del panel de reportes');
        const mockReports = [
          {
            id: 1,
            content_type: 'post',
            content_title: 'Mi primera publicación',
            content_id: '123',
            reason: 'spam',
            description: 'Este post parece spam',
            status: 'pending',
            created_at: '2024-01-15T10:30:00.000Z',
            reporter: {
              id: 2,
              alias: 'usuario_test',
              email: 'test@example.com'
            }
          },
          {
            id: 2,
            content_type: 'guide',
            content_title: 'Guía de React',
            content_id: '456',
            reason: 'inappropriate',
            description: 'Contenido inapropiado',
            status: 'under_review',
            created_at: '2024-01-14T15:45:00.000Z',
            reporter: {
              id: 3,
              alias: 'moderador_1',
              email: 'mod@example.com'
            }
          }
        ];
        
        return {
          reports: mockReports,
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_reports: mockReports.length
          }
        };
      }
      
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.status && { status: params.status }),
        ...(params.contentType && { content_type: params.contentType }),
        ...(params.reason && { reason: params.reason }),
        ...(params.sortBy && { sort_by: params.sortBy }),
        ...(params.sortOrder && { sort_order: params.sortOrder })
      });

      const url = `${API_URL}/admin/all?${queryParams}`;
      const response = await get(url);
      
      return response;
    } catch (error) {
      console.error('❌ REPORTES DEBUG - Error obteniendo reportes:', error);
      
      // Si el endpoint no está implementado (404)
      if (error.message.includes('404')) {
        console.warn('🚨 BACKEND: Los endpoints de administración de reportes necesitan ser implementados');
        throw new Error('⚠️ El panel de administración de reportes está en desarrollo. Los endpoints de admin aún no están disponibles en el backend.');
      }
      
      throw new Error('Error al cargar reportes.');
    }
  }

  /**
   * Actualizar estado de un reporte (solo para admins)
   * @param {string} reportId - ID del reporte
   * @param {string} status - Nuevo estado (under_review, resolved, dismissed)
   * @param {string} adminNotes - Notas del administrador
   * @param {string} action - Acción tomada (warning, ban, delete_content, etc.)
   * @returns {Promise<Object>} Reporte actualizado
   */
  async updateReportStatus(reportId, status, adminNotes = '') {
    const ADMIN_API_URL = '/admin/reports'; // URL base correcta para admin

    try {
      let response;
      if (status === 'resolved') {
        // 'resolved' se mapea a 'approve'.
        // Este endpoint no espera un body, así que pasamos `undefined`.
        response = await put(`${ADMIN_API_URL}/${reportId}/approve`, undefined);
      } else if (status === 'dismissed') {
        // 'dismissed' se mapea a 'reject'
        response = await put(`${ADMIN_API_URL}/${reportId}/reject`, {
          reason: adminNotes || 'Reporte descartado por un administrador.'
        });
      } else {
        // Si el estado no es ni 'resolved' ni 'dismissed', no hacemos nada.
        console.warn(`Estado de reporte no válido: ${status}. No se realizó ninguna acción.`);
        // Devolvemos una simulación de éxito para no romper el flujo del UI
        return { success: true, message: "Estado no válido, no se realizó acción." };
      }

      return response;
    } catch (error) {
      console.error('Error actualizando estado del reporte:', error);
      
      if (error.status === 403) {
        throw new Error('No tienes permisos para actualizar este reporte.');
      } else if (error.status === 404) {
        throw new Error('El reporte no existe o la URL de la API es incorrecta.');
      } else if (error.status === 500) {
        throw new Error('Error interno del servidor al procesar la solicitud. Contacta al desarrollador del backend.');
      } else {
        throw new Error('Error al actualizar el estado del reporte.');
      }
    }
  }

  /**
   * Obtener detalles de un reporte específico
   * @param {string} reportId - ID del reporte
   * @returns {Promise<Object>} Detalles del reporte
   */
  async getReportDetails(reportId) {
    try {
      const response = await get(`${API_URL}/${reportId}`);
      return response;
    } catch (error) {
      console.error('Error obteniendo detalles del reporte:', error);
      
      if (error.status === 403) {
        throw new Error('No tienes permisos para ver este reporte.');
      } else if (error.status === 404) {
        throw new Error('El reporte no existe.');
      } else {
        throw new Error('Error al cargar los detalles del reporte.');
      }
    }
  }

  /**
   * Eliminar un reporte (solo el creador o admin)
   * @param {string} reportId - ID del reporte
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async deleteReport(reportId) {
    try {
      const response = await del(`/admin/reports/${reportId}`);
      return response;
    } catch (error) {
      console.error('Error eliminando reporte:', error);
      
      if (error.status === 403) {
        throw new Error('No tienes permisos para eliminar este reporte.');
      } else if (error.status === 404) {
        throw new Error('El reporte no existe.');
      } else {
        throw new Error('Error al eliminar el reporte.');
      }
    }
  }

  /**
   * Verificar si el usuario puede reportar contenido específico
   * @param {string} contentId - ID del contenido
   * @param {string} contentType - Tipo de contenido
   * @returns {Promise<Object>} Estado de capacidad de reporte
   */
  async canReportContent(contentId, contentType) {
    try {
      const response = await get(`${API_URL}/can-report?content_id=${contentId}&content_type=${contentType}`);
      
      return response;
    } catch (error) {
      console.error('Error verificando capacidad de reporte:', error);
      // En caso de error, asumimos que sí puede reportar
      return { can_report: true, reason: null };
    }
  }

  /**
   * Obtener razones de reporte predefinidas
   * @returns {Array<Object>} Lista de razones de reporte
   */
  getReportReasons() {
    return [
      {
        value: 'spam',
        label: 'Spam o contenido irrelevante',
        description: 'Contenido que no aporta valor o es publicitario'
      },
      {
        value: 'harassment',
        label: 'Acoso o intimidación',
        description: 'Comportamiento hostil hacia otros usuarios'
      },
      {
        value: 'inappropriate',
        label: 'Contenido inapropiado',
        description: 'Contenido que viola las normas de la comunidad'
      },
      {
        value: 'offensive',
        label: 'Lenguaje ofensivo',
        description: 'Uso de palabras o expresiones ofensivas'
      },
      {
        value: 'misinformation',
        label: 'Información falsa',
        description: 'Contenido que contiene información incorrecta o engañosa'
      },
      {
        value: 'copyright',
        label: 'Violación de derechos de autor',
        description: 'Uso no autorizado de contenido protegido'
      },
      {
        value: 'violence',
        label: 'Contenido violento',
        description: 'Contenido que promueve o glorifica la violencia'
      },
      {
        value: 'other',
        label: 'Otro',
        description: 'Otro motivo no listado anteriormente'
      }
    ];
  }

  /**
   * Obtener tipos de contenido reportable
   * @returns {Array<Object>} Lista de tipos de contenido
   */
  getContentTypes() {
    return [
      { value: 'post', label: 'Publicación' },
      { value: 'comment', label: 'Comentario' },
      { value: 'guide', label: 'Guía' },
      { value: 'user', label: 'Usuario' },
      { value: 'review', label: 'Reseña' }
    ];
  }
}

const reportService = new ReportService();
export default reportService;