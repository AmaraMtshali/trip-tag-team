const express = require('express');
const app = express();
require('dotenv').config();

// CORS middleware for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

const sessionsRouter = require('./routes/sessions');
const membersRouter = require('./routes/members');

app.use('/api/sessions', sessionsRouter);
app.use('/api', membersRouter); // members routes mounted at /api/:sessionId/members

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bus Buddy Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
