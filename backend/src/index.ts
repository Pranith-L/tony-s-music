import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import trackRoutes from './routes/track.routes.js';
import albumRoutes from './routes/album.routes.js';
import videoRoutes from './routes/video.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import downloadRoutes from './routes/download.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security & Parsing Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Allows flexible video and asset embedding
  })
);

app.use(
  cors({
    origin: [
      CLIENT_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(morgan('dev'));

// Custom json parser to capture raw body for webhook signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'Tony Prakash Official API',
    timestamp: new Date().toISOString(),
    brand: "TONY'S MUSIC",
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/admin', adminRoutes);

// Stream real audio files from Tony Prakash songs directory
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidateSongsDirs = [
  path.resolve(process.cwd(), 'Tony Prakash songs'),
  path.resolve(process.cwd(), '..', 'Tony Prakash songs'),
  path.resolve(__dirname, '../../Tony Prakash songs'),
  path.resolve(__dirname, '../../../Tony Prakash songs'),
];
const songsDir = candidateSongsDirs.find((d) => fs.existsSync(d)) || candidateSongsDirs[0];
console.log('Serving audio files from:', songsDir);

app.use(
  '/api/audio',
  express.static(songsDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.wav')) {
        res.setHeader('Content-Type', 'audio/wav');
      } else if (filePath.endsWith('.mp3')) {
        res.setHeader('Content-Type', 'audio/mpeg');
      }
      res.setHeader('Accept-Ranges', 'bytes');
    },
  })
);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err?.message || 'Unknown error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✨ Tony's Music Server running on http://localhost:${PORT}`);
  console.log(`🎵 Ready for Tony Prakash Official Music Platform`);
});
