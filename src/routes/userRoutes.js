import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  res.status(200).json({ message: "테스트 라우트"});
});

export default router;