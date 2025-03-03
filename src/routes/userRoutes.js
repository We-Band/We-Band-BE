import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router(); 

router.get('/', async (req, res) => {
  res.status(200).json({ message: "테스트 라우트"});
  logger.info('테스트 라우트');
});

export default router;