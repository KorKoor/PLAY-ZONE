# ENDPOINTS NECESARIOS PARA EL PANEL DE ADMINISTRACIÓN

## 📋 **Resumen de Funcionalidades Implementadas**

Se ha completado la implementación del panel de administración con las siguientes funcionalidades:

1. **Dashboard con estadísticas**
2. **Gestión de reportes de contenido**
3. **Gestión avanzada de usuarios**
4. **CRUD completo de catálogo de juegos**

---

## 🔗 **ENDPOINTS REQUERIDOS EN LA API**

### **1. DASHBOARD Y ESTADÍSTICAS**

#### `GET /api/v1/admin/dashboard/stats`
**Descripción:** Obtiene estadísticas generales para el dashboard
```json
{
  "totalUsers": 1250,
  "totalGames": 340,
  "pendingReports": 5,
  "totalPosts": 2840,
  "totalGuides": 156,
  "activeUsers": 89,
  "usersTrend": 12,
  "gamesTrend": 3,
  "postsTrend": 25,
  "guidesTrend": 8,
  "activeTrend": -2,
  "recentActivity": [
    {
      "time": "hace 2 horas",
      "description": "Usuario @nuevo_jugador se registró"
    },
    {
      "time": "hace 5 horas", 
      "description": "Juego 'Cyberpunk 2077' agregado al catálogo"
    }
  ]
}
```

#### `GET /api/v1/admin/logs?page=1&limit=50`
**Descripción:** Obtiene logs de actividad del sistema
```json
{
  "logs": [
    {
      "timestamp": "2025-12-05T10:30:00Z",
      "action": "USER_REGISTERED",
      "user": "usuario_id",
      "details": "Nuevo usuario registrado"
    }
  ],
  "totalPages": 10,
  "currentPage": 1
}
```

---

### **2. GESTIÓN DE REPORTES DE CONTENIDO**

#### `GET /api/v1/admin/reports?type=all&status=pending`
**Descripción:** Obtiene lista de reportes de contenido
**Parámetros:**
- `type`: `all`, `post`, `guide`, `comment`, `user`
- `status`: `all`, `pending`, `approved`, `rejected`

```json
{
  "data": [
    {
      "_id": "report_id",
      "contentType": "post",
      "content": {
        "title": "Título del contenido reportado",
        "content": "Contenido completo del post/comentario/guía"
      },
      "reason": "spam",
      "description": "Descripción adicional del reporte",
      "reportedBy": {
        "_id": "user_id",
        "alias": "usuario_reportante"
      },
      "status": "pending",
      "createdAt": "2025-12-05T09:00:00Z",
      "resolvedAt": null,
      "rejectReason": null
    }
  ]
}
```

#### `PUT /api/v1/admin/reports/:reportId/approve`
**Descripción:** Aprueba un reporte (elimina el contenido)
```json
{
  "message": "Reporte aprobado exitosamente",
  "action": "content_removed"
}
```

#### `PUT /api/v1/admin/reports/:reportId/reject`
**Descripción:** Rechaza un reporte (mantiene el contenido)
**Body:**
```json
{
  "reason": "Contenido no viola las reglas"
}
```

---

### **3. GESTIÓN AVANZADA DE USUARIOS**

#### `PUT /api/v1/admin/users/:userId/ban`
**Descripción:** Banea a un usuario
**Body:**
```json
{
  "reason": "Violación de términos de servicio"
}
```

#### `PUT /api/v1/admin/users/:userId/unban`
**Descripción:** Desbanea a un usuario

#### `DELETE /api/v1/admin/users/:userId`
**Descripción:** Elimina permanentemente una cuenta de usuario

#### `PUT /api/v1/admin/users/:userId/role`
**Descripción:** Cambia el rol de un usuario
**Body:**
```json
{
  "role": "admin" // o "user"
}
```

---

### **4. GESTIÓN DE CATÁLOGO DE JUEGOS**

#### `GET /api/v1/admin/games?page=1&limit=10&search=`
**Descripción:** Obtiene lista paginada de juegos
```json
{
  "data": {
    "games": [
      {
        "_id": "game_id",
        "title": "The Witcher 3",
        "description": "Juego de RPG épico...",
        "genre": "RPG",
        "developer": "CD Projekt RED",
        "publisher": "CD Projekt",
        "releaseDate": "2015-05-19T00:00:00Z",
        "imageUrl": "https://example.com/witcher3.jpg",
        "platforms": ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
        "tags": ["RPG", "Mundo Abierto", "Fantasia"],
        "metacriticScore": 93,
        "steamUrl": "https://store.steampowered.com/app/292030/",
        "officialUrl": "https://thewitcher.com/en/witcher3",
        "createdAt": "2025-12-05T08:00:00Z",
        "updatedAt": "2025-12-05T08:00:00Z"
      }
    ],
    "totalPages": 34,
    "currentPage": 1,
    "totalGames": 340
  }
}
```

#### `POST /api/v1/admin/games`
**Descripción:** Crea un nuevo juego en el catálogo
**Body:**
```json
{
  "title": "Nuevo Juego",
  "description": "Descripción del juego",
  "genre": "Acción",
  "developer": "Desarrollador",
  "publisher": "Publicador", 
  "releaseDate": "2025-12-01",
  "imageUrl": "https://example.com/image.jpg",
  "platforms": ["PC", "PlayStation"],
  "tags": ["acción", "multijugador"],
  "metacriticScore": 85,
  "steamUrl": "https://steam.com/...",
  "officialUrl": "https://official.com/..."
}
```

#### `PUT /api/v1/admin/games/:gameId`
**Descripción:** Actualiza un juego existente
**Body:** (mismo formato que POST)

#### `DELETE /api/v1/admin/games/:gameId`
**Descripción:** Elimina un juego del catálogo

---

## 🔐 **MIDDLEWARE DE AUTORIZACIÓN NECESARIO**

Todos los endpoints del admin deben tener un middleware que verifique:

1. **Usuario autenticado** - Token JWT válido
2. **Rol de administrador** - `user.role === 'admin'`

```javascript
// Ejemplo de middleware
const adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Acceso denegado. Se requieren privilegios de administrador.' 
    });
  }
  next();
};
```

---

## 📊 **MODELOS DE BASE DE DATOS SUGERIDOS**

### **Modelo de Reporte**
```javascript
const reportSchema = {
  contentType: {
    type: String,
    enum: ['post', 'guide', 'comment', 'user'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    enum: ['spam', 'inappropriate', 'harassment', 'copyright', 'other'],
    required: true
  },
  description: String,
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  resolvedAt: Date,
  rejectReason: String,
  createdAt: { type: Date, default: Date.now }
};
```

### **Modelo de Juego**
```javascript
const gameSchema = {
  title: { type: String, required: true },
  description: String,
  genre: String,
  developer: String,
  publisher: String,
  releaseDate: Date,
  imageUrl: String,
  platforms: [String],
  tags: [String],
  metacriticScore: {
    type: Number,
    min: 0,
    max: 100
  },
  steamUrl: String,
  officialUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};
```

### **Actualizaciones al Modelo de Usuario**
```javascript
const userSchema = {
  // ... campos existentes ...
  isBanned: { type: Boolean, default: false },
  banReason: String,
  banDate: Date,
  lastActivity: { type: Date, default: Date.now }
};
```

---

## ⚡ **FUNCIONALIDADES OPCIONALES ADICIONALES**

### **Sistema de Logs de Actividad**
```javascript
const activityLogSchema = {
  action: String, // 'USER_REGISTERED', 'GAME_ADDED', etc.
  userId: mongoose.Schema.Types.ObjectId,
  targetType: String, // 'user', 'game', 'post', etc.
  targetId: mongoose.Schema.Types.ObjectId,
  details: String,
  timestamp: { type: Date, default: Date.now }
};
```

### **Endpoints de Reportes**
Los usuarios necesitarán poder crear reportes:

#### `POST /api/v1/reports`
**Descripción:** Crear un nuevo reporte
**Body:**
```json
{
  "contentType": "post",
  "contentId": "post_id",
  "reason": "spam",
  "description": "Este post contiene spam repetitivo"
}
```

---

## 🚀 **RESUMEN DE IMPLEMENTACIÓN**

### **Frontend Completado:**
✅ Panel de administración con navegación por tabs  
✅ Dashboard con estadísticas y métricas  
✅ Gestión completa de reportes de contenido  
✅ Gestión avanzada de usuarios (ban/unban/delete/role)  
✅ CRUD completo para catálogo de juegos  
✅ Diseño responsivo y moderno  
✅ Modal de detalles de usuario  
✅ Formularios de creación/edición de juegos  

### **Por Implementar en Backend:**
- [ ] Todos los endpoints listados arriba
- [ ] Middleware de autorización admin
- [ ] Modelos de base de datos para reportes y juegos
- [ ] Sistema de logs de actividad (opcional)
- [ ] Endpoints para que usuarios puedan crear reportes

### **Archivos Creados/Modificados:**
```
src/
├── services/adminService.js (NUEVO)
├── pages/AdminDashboard.jsx (ACTUALIZADO)
├── pages/AdminDashboard.css (NUEVO)
├── components/admin/
│   ├── AdminNavigation.jsx (NUEVO)
│   ├── AdminNavigation.css (NUEVO)
│   ├── DashboardOverview.jsx (NUEVO)
│   ├── DashboardOverview.css (NUEVO)
│   ├── ContentReports.jsx (NUEVO)
│   ├── ContentReports.css (NUEVO)
│   ├── UserManagement.jsx (ACTUALIZADO)
│   ├── UserManagement.css (NUEVO)
│   ├── UsersTable.jsx (ACTUALIZADO)
│   ├── UsersTable.css (NUEVO)
│   ├── UserDetailsModal.jsx (NUEVO)
│   ├── UserDetailsModal.css (NUEVO)
│   ├── GameCatalogManager.jsx (NUEVO)
│   └── GameCatalogManager.css (NUEVO)
```

¡El panel de administración está completamente implementado y listo para ser conectado con la API backend!