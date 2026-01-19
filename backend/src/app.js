const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const env = require('./config/env');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const salesRoutes = require('./routes/salesRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

const corsOptions = env.corsOrigins.length
  ? { origin: env.corsOrigins, credentials: true }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.traceId = randomUUID();
  res.setHeader('x-trace-id', req.traceId);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/ai', aiRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

app.use(errorMiddleware);

module.exports = app;
