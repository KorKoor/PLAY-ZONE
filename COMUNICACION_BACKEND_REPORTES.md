# 🚨 COMUNICACIÓN URGENTE - Equipo Backend

## 📋 **ESTADO ACTUAL DEL SISTEMA DE REPORTES**

### ✅ **LO QUE YA FUNCIONA EN FRONTEND:**
- Reporte de publicaciones y guías (**esperando backend**)
- Reporte de comentarios (**parcialmente implementado, falla en backend**)
- Panel de administración completo (**esperando endpoints**)
- Manejo de errores y validaciones del lado cliente

---

## 🔴 **PROBLEMAS DETECTADOS**

### **1. Endpoint `/api/v1/reports` responde 400 - "El contenido especificado no existe"**
**Caso de prueba que falla:**
- **contentId**: `69251118784d98d5ffec5a1a` 
- **contentType**: `comment`
- **Error**: El backend no encuentra el comentario o no soporta este tipo de contenido

### **2. Falta soporte para comentarios**
El backend parece no tener la lógica para validar/encontrar comentarios por ID.

---

## 🎯 **LO QUE NECESITAMOS QUE IMPLEMENTEN**

### **PRIORIDAD 1: Soporte para comentarios**

```javascript
// El frontend está enviando esto:
{
  "content_id": "69251118784d98d5ffec5a1a",
  "content_type": "comment",
  "reason": "spam",
  "description": "Comentario inapropiado",
  "reported_user_id": "userId123",
  "additional_info": {
    "comment_text": "texto del comentario",
    "post_title": "título del post donde está el comentario",
    "user_agent": "...",
    "timestamp": "2025-12-07...",
    "url": "..."
  }
}
```

**El backend debe:**
1. **Validar que el comentario existe** en la base de datos
2. **Aceptar `content_type: "comment"`** como válido
3. **Retornar error específico** si el comentario no existe
4. **Almacenar el texto del comentario** para que los admins lo vean

### **PRIORIDAD 2: Endpoint para administradores**

```javascript
// GET /api/v1/reports (solo admins)
// Debe retornar reportes con CONTENIDO COMPLETO
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_id",
        "content_id": "69251118784d98d5ffec5a1a",
        "content_type": "comment",
        "content_data": {
          "text": "TEXTO COMPLETO DEL COMENTARIO", // ← CRÍTICO
          "author": {
            "id": "userId",
            "alias": "username"
          }
        },
        "additional_data": {
          "post_title": "En qué post estaba el comentario"
        },
        "reporter": {
          "id": "reporterId", 
          "alias": "reporterName"
        },
        "reason": "spam",
        "description": "Comentario inapropiado",
        "status": "pending",
        "created_at": "2025-12-07T...",
        // ... otros campos
      }
    ]
  }
}
```

---

## 🔧 **IMPLEMENTACIÓN TÉCNICA REQUERIDA**

### **1. Validación de comentarios**
```sql
-- Ejemplo de query que el backend debe hacer
SELECT 
    c.id,
    c.text,
    c.authorId,
    p.title as post_title
FROM comments c
LEFT JOIN posts p ON c.postId = p.id  
WHERE c.id = ?
```

### **2. Estructura de tabla reportes (si no existe)**
```sql
CREATE TABLE reports (
    id VARCHAR PRIMARY KEY,
    content_id VARCHAR NOT NULL,
    content_type ENUM('post', 'guide', 'comment', 'user') NOT NULL,
    reporter_id VARCHAR NOT NULL,
    reported_user_id VARCHAR,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    content_snapshot JSON, -- ← Para archivar el contenido reportado
    additional_info JSON,
    status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_by VARCHAR,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **3. Lógica para archivar contenido**
Cuando se reporta un comentario, **GUARDAR UNA COPIA** en `content_snapshot`:
```json
{
  "text": "texto original del comentario",
  "author_id": "userId",
  "author_alias": "username", 
  "post_id": "postId",
  "post_title": "título del post",
  "created_at": "fecha del comentario"
}
```

**¿Por qué es importante?** Si el comentario se elimina después del reporte, los admins aún pueden verlo.

---

## 🧪 **CASOS DE PRUEBA PARA BACKEND**

### **Caso 1: Reportar comentario existente**
```bash
POST /api/v1/reports
{
  "content_id": "69251118784d98d5ffec5a1a",
  "content_type": "comment", 
  "reason": "spam"
}
```
**Resultado esperado**: `201 Created` + guardar reporte

### **Caso 2: Reportar comentario inexistente**
```bash
POST /api/v1/reports
{
  "content_id": "comentario_que_no_existe",
  "content_type": "comment",
  "reason": "spam"
}
```
**Resultado esperado**: 
```json
{
  "success": false,
  "message": "Los datos del reporte no son válidos",
  "errors": ["El comentario especificado no existe"]
}
```

### **Caso 3: Admin consulta reportes**
```bash
GET /api/v1/reports?content_type=comment&status=pending
```
**Resultado esperado**: Lista con `content_data.text` completo

---

## ⚡ **CRONOGRAMA SUGERIDO**

### **Esta semana:**
1. ✅ Implementar validación básica de comentarios
2. ✅ Hacer que `POST /api/v1/reports` acepte comentarios
3. ✅ Archivar texto del comentario en el reporte

### **Próxima semana:**
1. 🔄 Endpoint `GET /api/v1/reports` para admins
2. 🔄 Endpoint `PUT /api/v1/reports/{id}/status` para cambiar estado
3. 🔄 Validaciones anti-spam

---

## 🆘 **SI HAY PROBLEMAS TÉCNICOS**

### **Pregunta 1: ¿Cómo están estructurados los comentarios en la BD?**
Necesitamos saber:
- Tabla: `comments`, `comment`, `post_comments`?
- Campo ID: `id`, `_id`, `comment_id`?
- Relación con posts: `postId`, `post_id`?

### **Pregunta 2: ¿Qué ORM/Framework usan?**
Para ayudar con ejemplos específicos de código.

### **Pregunta 3: ¿Sistema de permisos implementado?**
Para saber cómo validar que un usuario es admin.

---

## 🔗 **DOCUMENTACIÓN ADICIONAL**

Ver archivo completo: `REQUERIMIENTOS_BACKEND_REPORTES.md`

---

## 💬 **CONTACTO INMEDIATO**

**Frontend está listo y esperando.** 

Una vez implementen el soporte básico para comentarios, podemos probar inmediatamente.

**¿Preguntas?** Responderé cualquier duda técnica específica.