const { createTeam, listTeams, updateTeam } = require('../services/teamService');

async function createTeamController(req, res) {
  try {
    const { name, userIds, captainUserId } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }
    const team = await createTeam({ name, userIds, captainUserId });
    return res.status(201).json(team);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

async function getTeamsController(req, res) {
  try {
    const teams = await listTeams();
    return res.json(teams);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

async function updateTeamController(req, res) {
  try {

    const { id } = req.params;
    const { name, userIds, captainUserId } = req.body;
    console.log("captainUserId", captainUserId);
    const team = await updateTeam(id, { name, userIds, captainUserId });
    return res.json(team);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

module.exports = {
  createTeamController,
  getTeamsController,
  updateTeamController
};


