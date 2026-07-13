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
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: [frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    provider: process.env.AI_PROVIDER || 'gemini',
    model: process.env.AI_MODEL_NAME || 'gemini-2.5-flash',
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', analyzeRoutes);

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
  console.log(`🤖 Dynamic AI Model Name: ${process.env.AI_MODEL_NAME || 'gemini-2.5-flash'}`);
  console.log(`=============================================`);
});
