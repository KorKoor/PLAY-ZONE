# Backend - API de Reportes Requerida

## Estado Actual
✅ **El endpoint `POST /api/v1/reports` está implementado y funcionando**
❌ **Los endpoints de administración NO están implementados**

## Endpoints Implementados

### ✅ 1. Crear Reporte (FUNCIONANDO)
```
POST /api/v1/reports
```

## Endpoints Faltantes para Administración

### ❌ 2. Obtener Todos los Reportes (Admin)
```
GET /api/v1/reports/admin/all?page=1&limit=10&status=pending&content_type=all&reason=all
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
```
page: número de página (default: 1)
limit: resultados por página (default: 10)
status: pending|reviewing|resolved|dismissed|all (default: pending)
content_type: post|guide|comment|user|all (default: all)
reason: spam|harassment|inappropriate|offensive|misinformation|copyright|violence|other|all (default: all)
sort_by: created_at|status|content_type (default: created_at)
sort_order: asc|desc (default: desc)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_id",
        "content_id": "content_id",
        "content_type": "guide",
        "reason": "spam",
        "description": "Contenido no relacionado con el juego",
        "reporter": {
          "id": "user_id",
          "alias": "usuario123"
        },
        "reported_user": {
          "id": "reported_user_id",
          "alias": "usuario_reportado"
        },
        "status": "pending",
        "admin_notes": null,
        "reviewed_by": null,
        "reviewed_at": null,
        "created_at": "2025-12-07T10:30:00.000Z",
        "updated_at": "2025-12-07T10:30:00.000Z",
        "additional_info": {
          "user_agent": "Mozilla/5.0...",
          "timestamp": "2025-12-07T10:30:00.000Z",
          "url": "http://localhost:3000/guides"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_reports": 50,
      "per_page": 10,
      "has_next": true,
      "has_prev": false
    },
    "stats": {
      "pending": 30,
      "reviewing": 10,
      "resolved": 8,
      "dismissed": 2
    }
  }
}
```

### ❌ 3. Actualizar Estado del Reporte (Admin)
```
PATCH /api/v1/reports/admin/{reportId}/status
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "reviewing|resolved|dismissed",
  "admin_notes": "string (opcional)",
  "action": "content_removed|user_warned|user_banned|no_action"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Estado del reporte actualizado",
  "data": {
    "id": "report_id",
    "status": "resolved",
    "admin_notes": "Contenido removido",
    "reviewed_by": "admin_user_id",
    "reviewed_at": "2025-12-07T11:00:00.000Z"
  }
}
```

### ❌ 4. Eliminar Reporte (Admin)
```
DELETE /api/v1/reports/admin/{reportId}
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Reporte eliminado exitosamente"
}
```

## Prioridad
🔴 **ALTA** - El panel de administración no puede funcionar sin estos endpoints

## Estado Temporal
El panel de administración muestra un mensaje informativo sobre la falta de endpoints hasta que sean implementados.

## Base de Datos Sugerida

### Tabla: `reports`
```sql
CREATE TABLE reports (
  id VARCHAR(36) PRIMARY KEY,
  content_id VARCHAR(36) NOT NULL,
  content_type ENUM('post', 'guide', 'comment', 'user') NOT NULL,
  reason ENUM('spam', 'harassment', 'inappropriate', 'offensive', 'misinformation', 'copyright', 'violence', 'other') NOT NULL,
  description TEXT,
  reporter_user_id VARCHAR(36) NOT NULL,
  reported_user_id VARCHAR(36),
  status ENUM('pending', 'reviewing', 'resolved', 'dismissed') DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by VARCHAR(36),
  reviewed_at TIMESTAMP NULL,
  additional_info JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (reporter_user_id) REFERENCES users(id),
  FOREIGN KEY (reported_user_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id),
  
  INDEX idx_content (content_id, content_type),
  INDEX idx_reporter (reporter_user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);
```

## Prioridad
🔴 **ALTA** - Este endpoint es necesario para el funcionamiento del sistema de reportes que ya está implementado en el frontend.

## Archivos Frontend que dependen de esta API:
- `src/services/reportService.js`
- `src/hooks/useReports.js`
- `src/components/common/ReportModal.jsx`
- `src/components/admin/ContentReports.jsx`

## Estado Temporal
Mientras tanto, el frontend muestra un mensaje informativo al usuario cuando intenta reportar contenido.