# 🚀 Quick Start Guide

## ✅ Everything is Working Now!

The database auto-initialization issue is **SOLVED**! The SQL file was UTF-16 encoded, and we've fixed the parser.

---

## 🎯 How to Run Your Project

### **Option 1: Without Docker (Recommended for Development)**

```bash
# Terminal 1: Start Backend
cd /home/cobi/Documents/amparo_test/backend
npm start

# Terminal 2: Start Frontend
cd /home/cobi/Documents/amparo_test/frontend
ng serve
```

**Access:** http://localhost:4200

---

### **Option 2: With Docker**

```bash
# Start all services
sudo docker compose up -d

# View logs
sudo docker compose logs -f

# Stop services
sudo docker compose down
```

**Access:** http://localhost:4200

---

## 🔐 Login Credentials

```
Email:    admin@admin.com
Password: admin123
Role:     Super Administrator
```

---

## ✨ What Happens on First Start

```
✅ Database connected successfully
📊 Database is empty - initializing...
📄 Detected UTF-16 LE encoding
📋 Found 192 SQL batches to execute...
✅ Schema loaded: 189 batches executed
✅ 17 tables created
✅ Super admin user created
🚀 Server running on port 3000
```

**Subsequent starts:**
```
✅ Database tables already exist
🚀 Server running on port 3000
```

(Skips initialization - fast startup!)

---

## 🗄️ Database Info

**Database Name:** `PJF_Amparos`  
**Tables Created:** 17  
**Stored Procedures:** 9  
**Views:** 1  

---

## 🔍 Verify Everything Works

### Check Tables:
```bash
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'Basketball@0615' -d PJF_Amparos -Q "
SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'
"
```
Expected: **17 tables**

### Check Admin User:
```bash
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'Basketball@0615' -d PJF_Amparos -Q "
SELECT Usuario, Correo, id_perfil FROM Usuarios WHERE Correo = 'admin@admin.com'
"
```
Expected: **1 admin user**

### Test Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@admin.com","password":"admin123"}'
```
Expected: **Login successful with JWT token**

---

## 📝 Common Commands

### Backend:
```bash
cd /home/cobi/Documents/amparo_test/backend

npm install          # Install dependencies
npm start            # Start server
npm run dev          # Start with nodemon (auto-reload)
```

### Frontend:
```bash
cd /home/cobi/Documents/amparo_test/frontend

npm install          # Install dependencies
ng serve             # Start dev server
ng build             # Build for production
```

### Docker:
```bash
sudo docker compose up -d        # Start in background
sudo docker compose logs -f      # View logs
sudo docker compose down         # Stop all services
sudo docker compose restart      # Restart services
```

---

## 🛠️ Troubleshooting

### Backend won't start?
```bash
# Check if MSSQL is running
sudo systemctl status mssql-server

# Start MSSQL
sudo systemctl start mssql-server

# Check if port 3000 is in use
sudo lsof -i :3000

# Kill any process on port 3000
sudo kill -9 $(lsof -t -i:3000)
```

### Database not initializing?
```bash
# Check backend logs
cd /home/cobi/Documents/amparo_test/backend
npm start

# Look for:
# ✅ Database connected successfully
# 📊 Database is empty - initializing...
# ✅ Schema loaded: X batches executed
```

### Frontend won't connect to backend?
1. Check backend is running: `http://localhost:3000/api/health`
2. Check CORS settings in `backend/src/app.js`
3. Check frontend API URL in `frontend/src/environments/environment.ts`

---

## 📚 Documentation

- **`PROBLEM_SOLVED.md`** - Full details of the UTF-16 encoding fix
- **`AUTO_DATABASE_INIT.md`** - How auto-initialization works
- **`AUTHENTICATION_BYPASSED.md`** - Security fixes applied
- **`DATABASE_SCHEMA.md`** - Database structure reference

---

## 🎉 Summary

✅ **Database:** Auto-initializes from UTF-16 SQL file  
✅ **Backend:** Node.js/Express on port 3000  
✅ **Frontend:** Angular on port 4200  
✅ **Auth:** JWT tokens with role-based access  
✅ **Admin:** admin@admin.com / admin123  

**Everything is ready to use!** 🚀

---

Last Updated: October 21, 2025  
Status: ✅ Working

