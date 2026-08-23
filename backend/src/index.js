import dotenv from 'dotenv';
import { createApp } from './app.js';
import { getUploadDir } from './utils/uploads.js';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 4000;

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('API Error:', err);
  const message = err.message || 'Internal server error';
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' && !err.expose ? 'Internal server error' : message,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Şirin Kids API (dev) running on 0.0.0.0:${PORT}`);
  console.log(`Uploads dir: ${getUploadDir()}`);
});

export default app;
