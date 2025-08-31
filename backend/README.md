# Bus Buddy Backend Setup

This backend provides API endpoints for the Bus Buddy application using Supabase as the database.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
```bash
npm run setup
```

This will create a `.env` file with the required environment variables.

### 3. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (ID: `pbleqpygrzisnxgbhwxa`)
3. Go to **Settings** > **API**
4. Copy the following values:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Update .env File
Edit the `backend/.env` file and replace the placeholder values:

```env
SUPABASE_URL=https://pbleqpygrzisnxgbhwxa.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
NODE_ENV=development
```

### 5. Set Up Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run** to create the tables

### 6. Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📋 API Endpoints

### Sessions
- `POST /api/sessions` - Create a new session
- `GET /api/sessions/short/:shortId` - Get session by short ID

### Members
- `POST /api/:sessionId/members` - Add a member to a session
- `PATCH /api/:sessionId/members/:memberId` - Update member status

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://pbleqpygrzisnxgbhwxa.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin access | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `PORT` | Server port (optional) | `3000` |
| `NODE_ENV` | Environment (optional) | `development` |

## 🗄️ Database Schema

### Sessions Table
- `id` - UUID primary key
- `short_id` - Short identifier for QR codes
- `name` - Session name
- `leader_name` - Leader's name
- `leader_phone` - Leader's phone number
- `leader_member_id` - Reference to leader's member record
- `created_at` - Creation timestamp
- `expires_at` - Expiration timestamp
- `updated_at` - Last update timestamp

### Members Table
- `id` - UUID primary key
- `session_id` - Reference to session
- `name` - Member name
- `phone_number` - Member phone number
- `role` - 'leader' or 'member'
- `status` - 'joined', 'present', or 'missing'
- `joined_at` - Join timestamp
- `last_activity` - Last activity timestamp
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## 🚨 Troubleshooting

### "Missing Supabase env vars" Error
1. Make sure you have a `.env` file in the `backend/` directory
2. Verify that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
3. Check that the values are correct from your Supabase dashboard

### Database Connection Issues
1. Verify your Supabase project is active
2. Check that the service role key has the correct permissions
3. Ensure the database tables are created using the schema

### CORS Issues
The backend is configured to allow all origins. If you need to restrict this, update the CORS configuration in `index.js`.

## 🔒 Security Notes

- The service role key has admin access to your database
- Keep your `.env` file secure and never commit it to version control
- The app uses Row Level Security (RLS) policies for data protection
- All endpoints are public since this is a public attendance tracking app

## 📝 Development

### Running in Development Mode
```bash
npm run dev
```

### Running in Production
```bash
npm start
```

### Testing Environment Variables
```bash
npm run test-env
```
