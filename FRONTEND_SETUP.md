# Frontend Setup Guide

## 🔧 Environment Configuration

### 1. Create Environment File
Create a `.env` file in the root directory with the following content:

```env
# Backend API URL (defaults to localhost:3000)
VITE_API_URL=http://localhost:3000/api

# For production, update this to your deployed backend URL
# VITE_API_URL=https://your-backend-domain.com/api
```

### 2. Development Setup
For local development, the default configuration will work:
- Frontend: `http://localhost:5173` (Vite dev server)
- Backend: `http://localhost:3000` (Express server)

### 3. Production Setup
For production deployment, update the `VITE_API_URL` to point to your deployed backend:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## 🚀 Running the Application

### Start Backend First
```bash
cd backend
npm install
npm run setup  # Configure environment variables
npm run dev    # Start backend server
```

### Start Frontend
```bash
# In a new terminal
npm install
npm run dev    # Start frontend development server
```

## 🔗 API Endpoints

The frontend now connects to these backend endpoints:

- `POST /api/sessions` - Create new session
- `GET /api/sessions/short/:shortId` - Get session by short ID
- `POST /api/:sessionId/members` - Add member to session
- `GET /api/:sessionId/members` - Get all members for session
- `PATCH /api/:sessionId/members/:memberId` - Update member status

## 📊 Data Flow

1. **Session Creation**: Leader creates session → stored in Supabase
2. **Member Join**: Member scans QR → joins session → stored in Supabase
3. **Real-time Updates**: Dashboard polls backend → displays live data
4. **Phone Numbers**: All contact info stored and displayed with copy functionality

## 🎯 Features Now Working

✅ **Database Storage**: All sessions and members stored in Supabase  
✅ **Real-time Updates**: Live member tracking with auto-refresh  
✅ **Phone Numbers**: Contact info with copy-to-clipboard  
✅ **QR Codes**: Working QR codes for check-in/check-out  
✅ **CSV Export**: Download member data with phone numbers  
✅ **CORS**: Proper cross-origin request handling  

## 🚨 Troubleshooting

### CORS Issues
- Backend is configured to allow all origins
- Check that backend is running on correct port
- Verify `VITE_API_URL` is correct

### Database Connection
- Ensure Supabase credentials are set in backend `.env`
- Verify database tables are created using `supabase/schema.sql`
- Check backend logs for connection errors

### QR Code Issues
- QR codes now use proper URLs based on current domain
- Test QR codes by copying the URL and opening in browser
- Ensure frontend is accessible from mobile devices
