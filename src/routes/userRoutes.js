import { logger } from '../utils/logger.js';

router.get('/', async (req, res) => {
  res.status(200).json({ message: "테스트 라우트"});
  logger.info('테스트 라우트');
});
