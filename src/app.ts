import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
// Routes - IMPORTANTE: Comenta estas líneas por ahora hasta que crees los archivos
// import uploadRoutes from './routes/upload';
// import mediaRoutes from './routes/media';
import uploadRoutes from './routes/upload';
import mediaRoutes from './routes/media';
import productRoutes from './routes/products';
import teamRoutes from './routes/teams';
import leagueRoutes from './routes/leagues';
import countryRoutes from './routes/countries';
import colorRoutes from './routes/colors';

dotenv.config();
connectDB();
const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: [ `${process.env.DEV_URL}`, `${process.env.CLIENT_URL}`, `${process.env.CLIENT_URL2}`, 'http://localhost:3000',],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por ventana
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Routes - COMENTA POR AHORA
// app.use('/api/upload', uploadRoutes);
// app.use('/api/media', mediaRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/products', productRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/colors', colorRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// 404 handler - CORREGIDO
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default app;