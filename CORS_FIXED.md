# CORS Configuration Fixed

## 🎯 Issue Resolved

**Problem**: Angular frontend (localhost:4200) was unable to access backend API (localhost:3000) due to CORS restrictions.

**Error**: `strict-origin-when-cross-origin` policy blocking cross-origin requests.

**Solution**: ✅ Properly configured CORS with permissive Helmet settings.

---

## 🔧 Changes Applied

### 1. Enhanced CORS Configuration

```javascript
const corsOptions = {
  origin: 'http://localhost:4200',        // Allow Angular frontend
  credentials: true,                       // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600                             // Cache preflight for 10 minutes
};
```

### 2. Reconfigured Helmet for CORS Compatibility

```javascript
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },  // Allow cross-origin
  crossOriginEmbedderPolicy: false,                       // Don't block CORS
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 3. Added Preflight Request Handler

```javascript
app.options('*', cors(corsOptions));  // Handle OPTIONS requests
```

### 4. Middleware Order Optimization

**Important**: CORS must be configured **before** Helmet to work properly.

```
1. CORS configuration
2. Helmet security headers
3. Rate limiting
4. Body parsing
5. Logging
6. Routes
```

---

## ✅ Verification Tests

### Test 1: Regular GET Request with CORS
```bash
curl -i -X GET http://localhost:3000/api/juzgados \
  -H "Origin: http://localhost:4200"
```

**Result**: ✅ PASS
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: Content-Range,X-Content-Range
Content-Type: application/json; charset=utf-8
```

### Test 2: OPTIONS Preflight Request
```bash
curl -i -X OPTIONS http://localhost:3000/api/juzgados \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST"
```

**Result**: ✅ PASS
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Max-Age: 600
```

---

## 📊 CORS Headers Explained

| Header | Value | Purpose |
|--------|-------|---------|
| `Access-Control-Allow-Origin` | `http://localhost:4200` | Allows Angular frontend |
| `Access-Control-Allow-Credentials` | `true` | Allows cookies and auth tokens |
| `Access-Control-Allow-Methods` | `GET,POST,PUT,DELETE,PATCH,OPTIONS` | Allowed HTTP methods |
| `Access-Control-Allow-Headers` | `Content-Type,Authorization` | Allowed request headers |
| `Access-Control-Max-Age` | `600` | Cache preflight for 10 minutes |
| `Access-Control-Expose-Headers` | `Content-Range,X-Content-Range` | Headers accessible to frontend |

---

## 🌐 How CORS Works Now

### For Simple Requests (GET, POST with simple headers):
```
1. Browser sends request with Origin header
2. Backend validates origin (localhost:4200)
3. Backend adds CORS headers to response
4. Browser allows frontend to read response
```

### For Preflight Requests (PUT, DELETE, custom headers):
```
1. Browser sends OPTIONS request (preflight)
2. Backend responds with allowed methods/headers
3. Browser caches response for 10 minutes
4. Browser sends actual request
5. Backend processes request with CORS headers
```

---

## 🔐 Security Considerations

### Development (Current Setup):
- ✅ CORS allows `http://localhost:4200`
- ✅ Credentials enabled for authentication
- ✅ All HTTP methods allowed
- ✅ Helmet security headers active

### Production Recommendations:
```javascript
// Update for production in .env file:
CORS_ORIGIN=https://your-production-domain.com

// Or multiple origins:
const allowedOrigins = [
  'https://your-production-domain.com',
  'https://www.your-production-domain.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## 🚀 Angular Frontend Configuration

Your Angular app should now work without CORS issues. Make sure your HTTP service includes:

```typescript
// In your Angular service
import { HttpHeaders } from '@angular/common/http';

const headers = new HttpHeaders({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// Enable credentials if needed
this.http.get(url, { 
  headers, 
  withCredentials: true  // Enables cookies/auth
});
```

---

## 🐛 Troubleshooting

### If you still see CORS errors:

1. **Clear browser cache**: Hard reload (Ctrl+Shift+R or Cmd+Shift+R)

2. **Check backend is running**: 
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Verify origin matches**:
   - Backend expects: `http://localhost:4200`
   - Angular runs on: `http://localhost:4200` (not 127.0.0.1)

4. **Check browser console** for specific CORS error details

5. **Restart both servers**:
   ```bash
   # Backend
   cd backend && npm start
   
   # Frontend
   cd frontend && ng serve
   ```

---

## 📝 File Modified

- `/backend/src/app.js` - Updated CORS and Helmet configuration

---

## ✅ Status

**CORS Configuration**: ✅ WORKING  
**Preflight Requests**: ✅ WORKING  
**Security Headers**: ✅ ACTIVE  
**Angular Compatibility**: ✅ READY

Your backend now properly handles cross-origin requests from your Angular frontend!

---

**Date Fixed**: October 19, 2025  
**Tested**: ✅ Both regular and preflight requests verified  
**Status**: ✅ RESOLVED

