# Troubleshooting Guide

## 🚨 Common Issues & Solutions

---

## 1. Connection Refused Error (`net::ERR_CONNECTION_REFUSED`)

### Problem:
```
POST http://localhost:3000/api/juzgados net::ERR_CONNECTION_REFUSED
HttpErrorResponse { status: 0, statusText: 'Unknown Error' }
```

### Cause:
Backend server is not running on port 3000.

### Solution:
```bash
# Navigate to backend directory
cd backend

# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

### Verification:
```bash
# Check if server is running
curl http://localhost:3000/api/health

# Expected response:
{"status":"OK","timestamp":"...","environment":"development"}
```

---

## 2. CORS Errors

### Problem:
```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:4200' 
has been blocked by CORS policy
```

### Solution:
✅ **Already Fixed** - CORS is properly configured in `backend/src/app.js`

If you still see CORS errors:
1. Clear browser cache (Ctrl+Shift+R)
2. Restart both frontend and backend servers
3. Check that Angular is running on `http://localhost:4200` (not 127.0.0.1)

---

## 3. Authentication Errors (401/403)

### Problem:
```
{"message":"Access token required"}
{"success":false,"message":"Token de acceso requerido"}
```

### Cause:
- No JWT token provided
- Invalid/expired token
- Insufficient permissions

### Solution:
1. **Login first** to get a token:
   ```typescript
   // In your Angular service
   this.authService.login(username, password).subscribe(response => {
     localStorage.setItem('token', response.token);
   });
   ```

2. **Include token in requests**:
   ```typescript
   const headers = new HttpHeaders({
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   });
   ```

3. **For admin operations**, ensure user has admin role (id_perfil = 1)

---

## 4. Database Connection Issues

### Problem:
```
Failed to connect to database
Connection timeout
```

### Solution:
1. **Check SQL Server is running**:
   ```bash
   # Check if SQL Server is running
   sudo systemctl status mssql-server
   ```

2. **Verify connection settings** in `backend/config/database.js`:
   ```javascript
   const config = {
     user: 'SA',
     password: 'Basketball@0615',
     server: 'localhost',
     port: 1433,
     database: 'PJF_Amparos'
   };
   ```

3. **Test connection**:
   ```bash
   cd backend
   node test-connection.js
   ```

---

## 5. Port Already in Use

### Problem:
```
Error: listen EADDRINUSE :::3000
```

### Solution:
1. **Find process using port 3000**:
   ```bash
   lsof -i :3000
   ```

2. **Kill the process**:
   ```bash
   kill -9 <PID>
   ```

3. **Or use a different port**:
   ```bash
   PORT=3001 npm start
   ```

---

## 6. Frontend Not Loading

### Problem:
Angular app not accessible at `http://localhost:4200`

### Solution:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if needed)
npm install

# Start development server
ng serve

# Or with specific port
ng serve --port 4200
```

---

## 🔧 Quick Diagnostic Commands

### Check Backend Status:
```bash
curl http://localhost:3000/api/health
```

### Check Database Connection:
```bash
cd backend && node test-connection.js
```

### Check Port Usage:
```bash
netstat -tulpn | grep :3000
netstat -tulpn | grep :4200
```

### Check Running Processes:
```bash
ps aux | grep node
ps aux | grep ng
```

---

## 📋 Startup Checklist

Before starting development:

1. ✅ **SQL Server running**:
   ```bash
   sudo systemctl start mssql-server
   ```

2. ✅ **Backend server running**:
   ```bash
   cd backend && npm start
   ```

3. ✅ **Frontend server running**:
   ```bash
   cd frontend && ng serve
   ```

4. ✅ **Database accessible**:
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## 🚨 Emergency Reset

If everything is broken:

1. **Stop all processes**:
   ```bash
   pkill -f node
   pkill -f ng
   ```

2. **Restart SQL Server**:
   ```bash
   sudo systemctl restart mssql-server
   ```

3. **Start backend**:
   ```bash
   cd backend && npm start &
   ```

4. **Start frontend**:
   ```bash
   cd frontend && ng serve &
   ```

5. **Verify**:
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## 📞 Support Information

### Logs Location:
- Backend: Check terminal output
- Frontend: Browser console (F12)
- Database: `/var/opt/mssql/log/`

### Configuration Files:
- Backend: `backend/config/database.js`
- Frontend: `frontend/src/environments/environment.ts`
- CORS: `backend/src/app.js`

### Common Ports:
- Backend API: `http://localhost:3000`
- Frontend: `http://localhost:4200`
- SQL Server: `localhost:1433`

---

**Last Updated**: October 19, 2025  
**Status**: ✅ All common issues documented
