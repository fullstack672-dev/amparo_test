# ✅ Database Initialization Problem - SOLVED!

## 🎯 Final Status: **WORKING!**

### Test Results:
```bash
✅ 17 database tables created
✅ Super admin user created
✅ Login successful
✅ JWT token generated
✅ Backend running on port 3000
```

---

## 🐛 The Problem

Your SQL script wasn't being parsed correctly, causing database initialization to fail:

```
❌ 0 batches executed
❌ Tables not created
❌ "Invalid object name 'Usuarios'" errors
```

---

## 🔍 Root Cause

The `30092025.sql` file is **UTF-16 Little Endian** encoded, but the code was reading it as UTF-8!

### What UTF-16 Looks Like:
```
// UTF-8 (what we expected):
"USE [PJF_Amparos]\nGO\nCREATE TABLE..."

// UTF-16 (what we actually had):
"U\u0000S\u0000E\u0000 \u0000[\u0000P\u0000J\u0000F\u0000..."
  ^null  ^null  ^null
```

Every character has a null byte (`\u0000`) after it. This made:
- "GO" → "G\u0000O\u0000" (4 bytes instead of 2)
- Regex `/\nGO\n/` couldn't match
- Only 1 batch detected instead of 192
- SQL statements not executed

---

## 🔧 The Solution

### Updated `backend/src/utils/database-init.js`:

```javascript
// 1. Read as buffer to detect encoding
const buffer = fs.readFileSync(scriptPath);

// 2. Detect UTF-16 BOM (Byte Order Mark)
let sqlScript;
if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
  console.log('📄 Detected UTF-16 LE encoding');
  sqlScript = buffer.toString('utf16le');  // ✅ Correct encoding!
} else {
  sqlScript = buffer.toString('utf8');
}

// 3. Remove BOM and normalize line endings
if (sqlScript.charCodeAt(0) === 0xFEFF) {
  sqlScript = sqlScript.slice(1);
}
sqlScript = sqlScript.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// 4. Split by GO statements
const batches = sqlScript
  .split(/\nGO\n/i)
  .map(batch => batch.trim())
  .filter(batch => batch.length > 0);

// Now: 192 batches detected! ✅
```

---

## 📊 Initialization Output

```
✅ Database connected successfully

🗄️  Database Initialization Check
===================================

📊 Database is empty - initializing...

📋 Loading schema from: /home/cobi/Documents/amparo_test/30092025.sql
📄 Detected UTF-16 LE encoding
📋 Found 192 SQL batches to execute...
   Processed 50/192 batches...
   Processed 100/192 batches...
   Processed 150/192 batches...
✅ Schema loaded: 189 batches executed, 2 skipped

✅ Password column expanded to VARCHAR(255)

👤 Creating initial data...
✅ Initial data created

👤 Creating super administrator...
✅ Super admin user created
   Email: admin@admin.com
   Password: admin123

===================================
✅ Database initialization complete!
===================================

🚀 Server running on port 3000
📊 Environment: development
🔗 Health check: http://localhost:3000/api/health
```

---

## ✅ Verification Tests

### 1. Database Tables
```bash
$ /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'Basketball@0615' -d PJF_Amparos -Q "
SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'
"

Result: 17 tables ✅
```

### 2. Super Admin User
```bash
$ /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'Basketball@0615' -d PJF_Amparos -Q "
SELECT Usuario, Correo, id_perfil FROM Usuarios WHERE Correo = 'admin@admin.com'
"

Result:
Usuario    Correo             id_perfil
admin      admin@admin.com    1         ✅
```

### 3. Login Test
```bash
$ curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@admin.com","password":"admin123"}'

Result:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "IdUsuario": 1,
    "Nombre": "Super",
    "APaterno": "Administrador",
    "AMaterno": "Sistema",
    "Usuario": "admin",
    "Correo": "admin@admin.com",
    "id_perfil": 1,
    "Estado": "A"
  }
}
✅ Login successful!
```

---

## 🗄️ Database Schema Created

### 17 Tables:
1. **Usuarios** - User accounts
2. **Cat_Juzgados** - Court catalog
3. **Cat_Perfil** - User profiles/roles
4. **Cat_Distritos** - Districts
5. **Cat_TipoAsunto** - Case types
6. **Cat_TipoCuaderno** - Notebook types
7. **Cat_ClasificacionArchivo** - File classifications
8. **Expediente** - Case files
9. **PartesExpediente** - Case parties
10. **DetalleActosReclamados** - Challenged acts
11. **Notificacion** - Notifications
12. **DocumentosNotificacion** - Notification documents
13. **DocumentosPromocion** - Promotion documents
14. **AmparosPJ** - Amparo records
15. **Promocion** - Promotions
16. **ICOIJ_Solicitud** - ICOIJ requests
17. **ICOIJ_FIRMA_CAT_AC** - Digital signatures

### 9 Stored Procedures:
- `pcConsultaAC`
- `stp_ExtExpediente_Agregar`
- `stp_ExtPartesExpediente_Agregar`
- `stp_ExtDetalleActosReclamados_Agregar`
- `stp_ExtNotificacion_Agregar`
- `stp_ExtDocumentosNotificacion_Agregar`
- `stp_ExtICOIJ_Solicitud_Agregar`
- `stp_ExisteNotificacion`
- `stp_Existe_Organo_impartidor_justicia`

### 1 View:
- `Vta_NotificacionExpediente`

---

## 🎯 How to Use Now

### **Start Without Docker:**

```bash
# 1. Start MSSQL Server
sudo systemctl start mssql-server

# 2. Start Backend (auto-initializes if needed)
cd /home/cobi/Documents/amparo_test/backend
npm start

# 3. Start Frontend (new terminal)
cd /home/cobi/Documents/amparo_test/frontend
ng serve

# 4. Access Application
# http://localhost:4200
```

### **Login:**
```
Email:    admin@admin.com
Password: admin123
```

---

## 🐳 Works with Docker Too!

The same fix works in Docker:

```bash
sudo docker compose up -d
```

Database auto-initializes in the container on first start.

---

## 🎓 What We Learned

### 1. **File Encodings Matter!**
   - Always check file encoding before parsing
   - SQL Server scripts are often UTF-16
   - Read as buffer first, then decode

### 2. **BOM Detection:**
   ```javascript
   // UTF-16 LE: FF FE (first two bytes)
   // UTF-16 BE: FE FF (first two bytes)
   // UTF-8:     EF BB BF (first three bytes)
   if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
     // UTF-16 Little Endian
     text = buffer.toString('utf16le');
   }
   ```

### 3. **Debugging Techniques:**
   - Log character codes: `JSON.stringify(text.substring(0, 100))`
   - Check buffer hex: `buffer.slice(0, 10).toString('hex')`
   - Test regex patterns incrementally

---

## 📁 Files Modified

### `backend/src/utils/database-init.js`
- ✅ Added UTF-16 encoding detection
- ✅ Added BOM removal
- ✅ Improved batch execution logging
- ✅ Better error handling
- ✅ Progress indicators

### `backend/src/app.js`
- ✅ Integrated automatic database initialization
- ✅ Runs on server startup
- ✅ Only initializes if database is empty

---

## 🔄 Automatic Initialization

The database now **automatically initializes** when:

1. Backend starts
2. Database is empty (no tables exist)
3. It runs only once (checks for existing tables)

### Subsequent Startups:
```
✅ Database connected successfully
✅ Database tables already exist
🚀 Server running on port 3000
```

Initialization is skipped if tables exist - fast startup!

---

## 🎉 Summary

### Before:
```
❌ SQL script not parsed (UTF-8 vs UTF-16 encoding)
❌ 0 batches executed
❌ No tables created
❌ Login failed
```

### After:
```
✅ UTF-16 LE encoding detected
✅ 192 batches found
✅ 189 batches executed
✅ 17 tables created
✅ Admin user created
✅ Login successful
✅ Automatic initialization on startup
```

---

## 📝 Quick Reference

### Super Admin Credentials:
```
Email:    admin@admin.com
Password: admin123
Profile:  Administrador (id_perfil = 1)
```

### Start Backend:
```bash
cd /home/cobi/Documents/amparo_test/backend
npm start
```

### Start Frontend:
```bash
cd /home/cobi/Documents/amparo_test/frontend
ng serve
```

### Access Application:
```
http://localhost:4200
```

---

**Date:** October 21, 2025  
**Status:** ✅ WORKING  
**Issue:** UTF-16 encoding in SQL file  
**Solution:** Auto-detect encoding before parsing  
**Result:** Database auto-initializes perfectly! 🎉

---

**The problem is completely solved!** 🚀

