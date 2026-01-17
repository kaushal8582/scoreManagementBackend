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
    const monthYear = req.query.monthYear || null;
    const stats = await getTeamStatsByWeek(monthYear);
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
    const monthYear = req.query.monthYear || null;
    const stats = await getTopTeams(limit, monthYear);
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
    const monthYear = req.query.monthYear || null;
    const stats = await getTopPerformers(limit, monthYear);
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
    const monthYear = req.query.monthYear || null;
    const totals = await getCategoryTotals(monthYear);
    
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
    const monthYear = req.query.monthYear || null;
    const stats = await getUserBreakdown({ limit, teamId, monthYear });
    return res.json(stats);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

async function getTeamBreakdownController(req, res) {
  try {
    const monthYear = req.query.monthYear || null;
    const stats = await getTeamBreakdown(monthYear);
    return res.json(stats);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}


