const {
  getTeamStats,
  getTopTeams,
  getTopPerformers,
  getTeamStatsByWeek,
  getUserTotals
} = require('../services/dashboardService');

async function getTeamStatsController(req, res) {
  try {
    const stats = await getTeamStatsByWeek();
    return res.json(stats);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

async function getTopTeamsController(req, res) {
  try {
    const limit = Number(req.query.limit || 3);
    const stats = await getTopTeams(limit);
    return res.json(stats);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

async function getTopPerformersController(req, res) {
  try {
    const limit = Number(req.query.limit || 3);
    const stats = await getTopPerformers(limit);
    return res.json(stats);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

module.exports = {
  getTeamStatsController,
  getTopTeamsController,
  getTopPerformersController,
  getUserTotalsController
};

async function getUserTotalsController(req, res) {
  try {
    const stats = await getUserTotals();
    return res.json(stats);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}


