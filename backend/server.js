import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import analyzeRoutes from './src/routes/analyzeRoutes.js';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration (dynamic bindings)
let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
  frontendUrl = `https://${frontendUrl}`;
}

app.use(cors({
  origin: [
    frontendUrl,
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoints
app.get('/health', (req, res) => {
  const provider = process.env.AI_PROVIDER || 'gemini';
  let model = process.env.AI_MODEL_NAME || (provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini');
  if (model === 'gemini-2.5-flash') {
    model = 'gemini-1.5-flash';
  }
  res.json({
    status: 'online',
    provider: provider,
    model: model,
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', analyzeRoutes);

// Fallback handlers to capture Google OAuth requests that skip the /api/auth prefix
app.get('/google', (req, res) => {
  res.redirect('/api/auth/google');
});
app.get('/google/callback', (req, res) => {
  const queryParams = new URLSearchParams(req.query).toString();
  res.redirect(`/api/auth/google/callback?${queryParams}`);
});

// Fallback Route Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global server exception:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Activate Port
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 Server is active on port: ${PORT}`);
  console.log(`🔗 Allowed CORS origin: ${frontendUrl}`);
  console.log(`🧠 Dynamic AI Provider: ${process.env.AI_PROVIDER || 'gemini'}`);
  console.log(`🤖 Dynamic AI Model Name: ${process.env.AI_MODEL_NAME || 'gemini-1.5-flash'}`);
  console.log(`=============================================`);
});
