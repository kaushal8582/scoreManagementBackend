const Team = require('../models/Team');
const User = require('../models/User');

async function createTeam({ name, userIds = [], captainUserId = null }) {
  try {
    
    const existing = await Team.findOne({ name });
    if (existing) {
      const error = new Error('Team name must be unique');
      error.statusCode = 400;
      throw error;
    }
  
  const team = await Team.create({ name, users: userIds, captainUserId });
  
    if (userIds.length > 0) {
      await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { teamId: team._id } }
      );
    }
  
    return team;
  } catch (error) {
    throw error;
  }
}

async function listTeams() {
  try {
    return Team.find()
      .populate('users', 'firstName lastName fullName category')
      .populate('captainUserId', 'firstName lastName fullName');
  } catch (error) {
    throw error;
  }
}

async function updateTeam(id, { name, userIds, captainUserId }) {
  try {
    
    const team = await Team.findById(id);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }
  
    if (name && name !== team.name) {
      const existing = await Team.findOne({ name });
      if (existing) {
        const error = new Error('Team name must be unique');
        error.statusCode = 400;
        throw error;
      }
      team.name = name;
    }
  
  if (Array.isArray(userIds)) {
      // Clear teamId from users that are no longer in this team
      await User.updateMany(
        { teamId: team._id, _id: { $nin: userIds } },
        { $set: { teamId: null } }
      );
  
      // Assign this teamId to provided users
      await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { teamId: team._id } }
      );
  
      team.users = userIds;
    }
  
    // console.log("captainUserId", captainUserId);
  if ( captainUserId ) {
    team.captainUserId = captainUserId || null;
  }
  
  await team.save();
  return team;
  } catch (error) {
    throw error;
  }
}

async function deleteTeam(id) {
  
  try {
    const team = await Team.findById(id);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }
    // Clear teamId from users of this team
    await User.updateMany({ teamId: team._id }, { $set: { teamId: null } });
    await Team.deleteOne({ _id: team._id });
    return { deletedTeamId: id };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createTeam,
  listTeams,
  updateTeam,
  deleteTeam
};


