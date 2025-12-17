const Team = require('../models/Team');
const UserWeeklyStat = require('../models/UserWeeklyStat');
const WeeklyReport = require('../models/WeeklyReport');
const User = require('../models/User');

async function getTeamStats() {
  // Aggregate total points per team across all weeks
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.teamId',
          totalPoints: { $sum: '$totalPoints' }
        }
      },
      {
        $lookup: {
          from: 'teams',
          localField: '_id',
          foreignField: '_id',
          as: 'team'
        }
      },
      { $unwind: '$team' },
      {
        $project: {
          _id: 0,
          teamId: '$team._id',
          teamName: '$team.name',
          totalPoints: 1
        }
      },
      { $sort: { totalPoints: -1 } }
    ];
  
    return UserWeeklyStat.aggregate(pipeline);
  } catch (error) {
    throw error;
  }
}

async function getTopTeams(limit = 3) {
  const stats = await getTeamStats();
  return stats.slice(0, limit);
}

async function getTopPerformers(limit = 3) {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$totalPoints' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'teams',
        localField: 'user.teamId',
        foreignField: '_id',
        as: 'team'
      }
    },
    { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        userId: '$user._id',
        fullName: '$user.fullName',
        teamName: '$team.name',
        totalPoints: 1
      }
    },
    { $sort: { totalPoints: -1 } },
    { $limit: limit }
  ];

    return UserWeeklyStat.aggregate(pipeline);
  } catch (error) {
    throw error;
  }
}

async function getTeamStatsByWeek() {
  // Useful for charts: points grouped by team and week
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'teams',
          localField: 'user.teamId',
          foreignField: '_id',
          as: 'team'
      }
    },
    { $unwind: '$team' },
    {
      $lookup: {
        from: 'weeklyreports',
        localField: 'weekId',
        foreignField: '_id',
        as: 'week'
      }
    },
    { $unwind: '$week' },
    {
      $group: {
        _id: {
          teamId: '$team._id',
          teamName: '$team.name',
          weekStartDate: '$week.weekStartDate'
        },
        totalPoints: { $sum: '$totalPoints' }
      }
    },
    {
      $project: {
        _id: 0,
        teamId: '$_id.teamId',
        teamName: '$_id.teamName',
        weekStartDate: '$_id.weekStartDate',
        totalPoints: 1
      }
    },
    { $sort: { weekStartDate: 1, teamName: 1 } }
  ];

    return UserWeeklyStat.aggregate(pipeline);
  } catch (error) {
    throw error;
  }
}

// Aggregate total points per user across all weeks
async function getUserTotals() {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$totalPoints' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {  
        from: 'teams',
        localField: 'user.teamId',
        foreignField: '_id',
        as: 'team'
      }
    },
    { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        userId: '$user._id',
        fullName: '$user.fullName',
        teamName: '$team.name',
        totalPoints: 1
      }
    },
    { $sort: { totalPoints: -1 } }
  ];

    return UserWeeklyStat.aggregate(pipeline);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getTeamStats,
  getTopTeams,
  getTopPerformers,
  getTeamStatsByWeek,
  getUserTotals
};


