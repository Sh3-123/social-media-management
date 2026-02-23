const express = require('express');
const router = express.Router();
const { getPosts, getPostById, syncPosts } = require('../controllers/postController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/sync', syncPosts);

module.exports = router;
