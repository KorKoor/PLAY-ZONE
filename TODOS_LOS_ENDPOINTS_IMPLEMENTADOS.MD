# 📚 DOCUMENTACIÓN COMPLETA - ENDPOINTS API PLAY-ZONE

## 🔐 AUTENTICACIÓN
Todos los endpoints requieren autenticación JWT excepto los de registro/login.
Header: `Authorization: Bearer <token>`

## 🧑‍💻 AUTENTICACIÓN Y USUARIOS

### POST /api/v1/auth/register
Registro de nuevo usuario
Body: { alias, email, password }
Response: { success, message, data: { user, token } }

### POST /api/v1/auth/login  
Iniciar sesión
Body: { email, password }
Response: { success, message, data: { user, token } }

### GET /api/v1/users/:userId
Obtener perfil de usuario
Response: { user: { alias, email, avatarUrl, description, followersCount, followingCount, recentPosts, recentGuides } }

### PUT /api/v1/users/:userId
Actualizar perfil propio
Body: { description, avatarUrl, consoles, genres }
Response: { message, user }

### GET /api/v1/users/search
Buscar usuarios
Query: search, page=1, limit=10, sortBy=alias, sortOrder=asc
Response: { success, users, pagination }

### GET /api/v1/users/active
Obtener usuarios activos
Response: { activeUsers }

### GET /api/v1/users/
Obtener todos los usuarios (admin)
Response: { users }

### PUT /api/v1/users/:userId/follow
Seguir/dejar de seguir usuario
Response: { message, isFollowing, followersCount }

## 📝 PUBLICACIONES (POSTS)

### POST /api/v1/posts
Crear nueva publicación
Body: { gameTitle, description, rating }
Files: image (opcional)
Response: Post creado con autor poblado

### GET /api/v1/posts/feed
Feed principal de publicaciones
Query: page=1, sortBy=recent|popular
Response: { posts, pagination }

### GET /api/v1/posts/:postId
Obtener publicación específica
Response: Post con autor, comentarios y estado de like/favorito

### GET /api/v1/posts/search
Buscar publicaciones
Query: q (requerido), page=1, limit=10, sortBy=relevance|date|title, sortOrder=desc
Response: { success, posts, pagination }

### PUT /api/v1/posts/:postId/like
Dar/quitar like a publicación
Response: { message, isLiked, likesCount }

### GET /api/v1/posts/:postId/likes
Obtener lista de usuarios que dieron like
Response: { likes }

### PUT /api/v1/posts/:postId/favorite
Marcar/desmarcar como favorito
Response: { message, isFavorite }

### GET /api/v1/posts/:postId/favorite-status
Verificar estado de favorito
Response: { isFavorite }

### POST /api/v1/posts/:postId/comments
Crear comentario en publicación
Body: { content }
Response: Comentario creado con autor poblado

### GET /api/v1/posts/:postId/comments
Obtener comentarios de publicación
Response: { comments }

## 📖 GUÍAS

### POST /api/v1/guides
Crear nueva guía
Body: { title, game, description, steps }
Response: Guía creada con autor poblado

### GET /api/v1/guides
Obtener/buscar guías
Query: search, category, difficulty, page=1, limit=10, sortBy=date|popularity|title
Response: { success, guides, pagination }

### GET /api/v1/guides/:guideId
Obtener guía específica
Response: Guía con autor y estado isUseful

### PUT /api/v1/guides/:guideId
Actualizar guía (solo autor)
Body: { title, game, description, steps }
Response: Guía actualizada

### DELETE /api/v1/guides/:guideId
Eliminar guía (solo autor)
Response: { message }

### PUT /api/v1/guides/:guideId/useful
Marcar/desmarcar como útil
Response: { message, isUseful, usefulCount }

### POST /api/v1/guides/:guideId/comments
Crear comentario en guía
Body: { content }
Response: Comentario creado

### GET /api/v1/guides/:guideId/comments
Obtener comentarios de guía
Response: { comments }

## 🎮 JUEGOS

### GET /api/v1/games
Obtener lista de juegos
Query: page=1, limit=10, category, platform
Response: { games, pagination }

### GET /api/v1/games/:gameId
Obtener juego específico
Response: Juego con detalles completos

## 🔍 BÚSQUEDA GLOBAL

### GET /api/v1/search
Búsqueda global en todo el contenido
Query: q (requerido), type=all|users|games|posts|guides, category, sortBy=relevance|date|name, sortOrder=desc, page=1, limit=10
Response: { success, query, users: { data, total, totalPages, currentPage }, games: {...}, posts: {...}, guides: {...} }

### GET /api/v1/search/suggestions
Sugerencias de búsqueda en tiempo real
Query: q (mín 2 caracteres)
Response: { success, suggestions: [{ type, title, id, subtitle }] }

### GET /api/v1/search/filters
Obtener filtros disponibles
Response: { success, categories, difficulties, genres, platforms }

## 💬 COMENTARIOS

### GET /api/v1/comments/:commentId
Obtener comentario específico
Response: { success, data: { comentario con autor y post/guía } }

### DELETE /api/v1/comments/:commentId
Eliminar comentario (autor o admin)
Response: { success, message }

## 🚨 REPORTES

### POST /api/v1/reports
Crear reporte de contenido
Body: { content_id, content_type (post|guide|comment|user), reason, description, additional_info }
Response: { success, message, data: { id, status } }

### GET /api/v1/reports
Obtener reportes (admin)
Query: status=pending|reviewed|resolved|dismissed, content_type, page=1, limit=10
Response: { success, data: { reports con content_data completo, pagination, stats } }

### PUT /api/v1/reports/:reportId/status
Actualizar estado de reporte (admin)
Body: { status, admin_notes, action }
Response: { success, message, data }

### GET /api/v1/reports/check-duplicate
Verificar si usuario ya reportó contenido
Query: content_id, content_type
Response: { success, data: { already_reported, report_id, report_status } }

### GET /api/v1/reports/my-reports
Obtener reportes propios del usuario
Query: page=1, limit=10
Response: { success, data, pagination }

## ⭐ FAVORITOS

### GET /api/v1/favorites
Obtener favoritos del usuario
Response: { favorites }

## 📁 ARCHIVOS

### POST /api/v1/upload
Subir archivo
Files: file
Response: { fileUrl }

## 👑 ADMINISTRACIÓN

### GET /api/v1/admin/users
Obtener usuarios (admin)
Response: Lista de usuarios para administración

### PUT /api/v1/admin/users/:userId/status
Cambiar estado de usuario (admin)
Body: { status }
Response: { message }

## 📊 CÓDIGOS DE ESTADO

### Éxito
- 200: OK
- 201: Created

### Error Cliente
- 400: Bad Request (datos inválidos)
- 401: Unauthorized (no autenticado)
- 403: Forbidden (sin permisos)
- 404: Not Found
- 409: Conflict (duplicado)
- 429: Too Many Requests

### Error Servidor
- 500: Internal Server Error

## 🔧 FILTROS Y PARÁMETROS COMUNES

### Paginación
- page: Número de página (default: 1)
- limit: Elementos por página (default: 10)

### Ordenamiento
- sortBy: Campo de ordenamiento
- sortOrder: asc | desc

### Búsqueda
- q: Término de búsqueda (mínimo 2 caracteres)
- search: Término de búsqueda alternativo

### Filtros
- category: Categoría de contenido
- difficulty: Dificultad (beginner|intermediate|advanced|expert)
- type: Tipo de contenido
- status: Estado del contenido

## 🌐 URL BASE
http://localhost:8000/api/v1

## 📝 NOTAS
- Todos los timestamps están en formato ISO 8601
- Los IDs son ObjectId de MongoDB (24 caracteres hex)
- Las respuestas incluyen campo "success": true/false
- Los errores incluyen mensaje descriptivo
- Rate limiting: 10 reportes por día por usuario
- Archivos soportados: imágenes (jpg, png, gif, webp)
- Tamaño máximo de archivo: 5MB