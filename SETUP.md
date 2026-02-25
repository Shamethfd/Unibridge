# LearnBridge Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (installed and running)

## Quick Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Environment Variables

Create `.env` file in backend folder:
```
MONGODBURL=mongodb://127.0.0.1:27017/learnbridge
PORT=5000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=learnbridge_secret_key_123456789
JWT_EXPIRE=30d
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend folder:
```
REACT_APP_API_URL=http://localhost:5000
```

### 4. Start Applications

**Start MongoDB** (if not running):
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

**Start Backend**:
```bash
cd backend
npm start
```

**Start Frontend** (in separate terminal):
```bash
cd frontend
npm start
```

## Troubleshooting Registration Issues

### Issue: "Server error during registration"

**Common Causes:**

1. **MongoDB not running**
   - Solution: Start MongoDB service
   - Check: `mongod` should be running

2. **Environment variables missing**
   - Solution: Create `.env` files as shown above
   - Check: Backend should show "Connected to MongoDB" on startup

3. **Port conflicts**
   - Solution: Change PORT in backend `.env` file
   - Default: Backend uses 5000, Frontend uses 3000

4. **CORS issues**
   - Solution: Ensure CORS_ORIGIN matches frontend URL
   - Default: `http://localhost:3000`

### Test Connection

1. Backend health check: `http://localhost:5000/api/health`
2. Frontend should be accessible at: `http://localhost:3000`

## Default Test User

After setup, you can register with:
- Email: test@example.com
- Password: password123
- Username: testuser
