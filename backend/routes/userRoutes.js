const express = require('express');
const router = express.Router();
const { register, login, getProfile, updatePassword } = require('../controllers/userController');
const { logCatch, getRecords, getStatistics, updateCatch, deleteCatch } = require('../controllers/catchController');
const { protect } = require('../middleware/authMiddleware');

// ─── Auth Routes (Public) ───
router.post('/register', register);
router.post('/login', login);

// ─── Profile Routes (Protected) ───
router.get('/profile', protect, getProfile);
router.put('/password', protect, updatePassword);

// ─── Catch Routes (Protected) ───
router.post('/catches', protect, logCatch);
router.get('/catches', protect, getRecords);
router.put('/catches/:id', protect, updateCatch);
router.delete('/catches/:id', protect, deleteCatch);

// ─── Statistics Route (Protected) ───
router.get('/statistics', protect, getStatistics);

module.exports = router;