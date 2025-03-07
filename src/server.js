import http from 'http';
import app from './app.js';
import { PrismaClient } from '@prisma/client';
import { checkS3Connection } from './config/s3config.js';
import { logger } from './utils/logger.js';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

prisma.$connect()
  .then(() => logger.info('prisma connected'))
  .catch((error) => logger.error('prisma connection error', err));

const server = http.createServer(app);

server.listen(PORT, async() => {
  logger.info(`Server running on http://localhost:${PORT}`);
  await checkS3Connection(); // S3 연결 확인
})