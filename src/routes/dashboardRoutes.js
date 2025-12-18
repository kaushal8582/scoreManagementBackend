const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getTeamStatsController,
  getTopTeamsController,
  getTopPerformersController,
  getUserTotalsController,
  getCategoryTotalsController,
  getTeamBreakdownController,
  getUserBreakdownController,
} = require('../controllers/dashboardController');

const router = express.Router();

router.get('/team-stats', authMiddleware, getTeamStatsController);
router.get('/top-teams', authMiddleware, getTopTeamsController);
router.get('/top-performers', authMiddleware, getTopPerformersController);
router.get('/user-totals', authMiddleware, getUserTotalsController);
router.get('/category-totals', authMiddleware, getCategoryTotalsController);
router.get('/user-breakdown', authMiddleware, getUserBreakdownController);
router.get('/team-breakdown', authMiddleware, getTeamBreakdownController);

module.exports = router;


