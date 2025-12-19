const {
  getTeamStats,
  getTopTeams,
  getTopPerformers,
  getTeamStatsByWeek,
  getUserTotals,
  getCategoryTotals,
  getUserBreakdown,
  getTeamBreakdown
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
  getUserTotalsController,
  getCategoryTotalsController,
  getUserBreakdownController,
  getTeamBreakdownController
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

async function getCategoryTotalsController(req, res) {
  try {
    const totals = await getCategoryTotals();
    
    return res.json(totals);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

async function getUserBreakdownController(req, res) {
  try {
    const limit = Number(req.query.limit || 7);
    const teamId = req.query.teamId ? req.query.teamId : null;
    const stats = await getUserBreakdown({ limit, teamId });
    return res.json(stats);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

async function getTeamBreakdownController(req, res) {
  try {
    const stats = await getTeamBreakdown();
    return res.json(stats);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}


