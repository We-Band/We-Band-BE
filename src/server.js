import http from 'http';
import app from './app.js';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger.js';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

prisma.$connect()
  .then(() => logger.info('prisma connected'))
  .catch((error) => logger.error('prisma connection error', err));
 
const server = http.createServer(app);

server.listen(PORT, async() => {
  logger.info(`Server running on http://localhost:${PORT}`);
})