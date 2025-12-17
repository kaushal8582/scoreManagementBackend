const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getTeamStatsController,
  getTopTeamsController,
  getTopPerformersController,
  getUserTotalsController,
} = require('../controllers/dashboardController');

const router = express.Router();

router.get('/team-stats', authMiddleware, getTeamStatsController);
router.get('/top-teams', authMiddleware, getTopTeamsController);
router.get('/top-performers', authMiddleware, getTopPerformersController);
router.get('/user-totals', authMiddleware, getUserTotalsController);

module.exports = router;


