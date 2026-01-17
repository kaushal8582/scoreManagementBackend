const Team = require('../models/Team');
const UserWeeklyStat = require('../models/UserWeeklyStat');
const WeeklyReport = require('../models/WeeklyReport');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to parse month/year from query (format: "YYYY-MM")
function parseMonthYear(monthYearStr) {
  if (!monthYearStr) return null;
  const parts = monthYearStr.split('-');
  if (parts.length !== 2) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return null;
  return { year, month };
}

async function getTeamStats(monthYear = null) {
  // Aggregate total points per team across all weeks
  try {
    const monthYearFilter = parseMonthYear(monthYear);
    const pipeline = [
      {
        $lookup: {
          from: 'weeklyreports',
          localField: 'weekId',
          foreignField: '_id',
          as: 'week'
        }
      },
      { $unwind: '$week' }
    ];

    // Add month/year filter if provided
    if (monthYearFilter) {
      pipeline.push({
        $match: {
          'week.month': monthYearFilter.month,
          'week.year': monthYearFilter.year
        }
      });
    }

    pipeline.push(
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
    );
  
    return UserWeeklyStat.aggregate(pipeline);
  } catch (error) {
    throw error;
  }
}

// Aggregate totals across all categories for all weeks
async function getCategoryTotals(monthYear = null) {
  try {
    const monthYearFilter = parseMonthYear(monthYear);
    
    const pipeline = [
      {
        $lookup: {
          from: 'weeklyreports',
          localField: 'weekId',
          foreignField: '_id',
          as: 'week'
        }
      },
      { $unwind: '$week' }
    ];

    // Add month/year filter if provided
    if (monthYearFilter) {
      pipeline.push({
        $match: {
          'week.month': monthYearFilter.month,
          'week.year': monthYearFilter.year
        }
      });
    }

    pipeline.push(
      {
        $group: {
          _id: null,
          P: { $sum: '$P' },
          A: { $sum: '$A' },
          L: { $sum: '$L' },
          M: { $sum: '$M' },
          S: { $sum: '$S' },
          RGI: { $sum: '$RGI' },
          RGO: { $sum: '$RGO' },
          RRI: { $sum: '$RRI' },
          RRO: { $sum: '$RRO' },
          TR: { $sum: '$TR' },
          CON: { $sum: '$CON' },
          V: { $sum: '$V' },
          oneToOne: { $sum: '$oneToOne' },
          CEU: { $sum: '$CEU' },
          T: { $sum: '$T' },
          TYFCB_amount: { $sum: '$TYFCB_amount' },
          totalPoints: { $sum: '$totalPoints' }
        }
      },
      {
        $project: {
          _id: 0,
          P: 1,
          A: 1,
          L: 1,
          M: 1,
          S: 1,
          RGI: 1,
          RGO: 1,
          RRI: 1,
          RRO: 1,
          V: 1,
          oneToOne: 1,
          CEU: 1,
          T: 1,
          TYFCB_amount: 1,
          totalPoints: 1,
          TR: 1,
          CON: 1
        }
      }
    );
    const res = await UserWeeklyStat.aggregate(pipeline);

    // console.log("response", res);

    return res[0] || {
      P: 0,
      A: 0,
      L: 0,
      M: 0,
      S: 0,
      RGI: 0,
      RGO: 0,
      RRI: 0,
      RRO: 0,
      V: 0,
      oneToOne: 0,
      CEU: 0,
      T: 0,
      TR: 0,
      CON: 0,
      TYFCB_amount: 0,
      totalPoints: 0
    };
  } catch (error) {
    throw error;
  }
}

// Per-user breakdown across all weeks.
// When teamId is provided, include ALL team members (even with zero stats).
async function getUserBreakdown({ limit = 7, teamId = null, monthYear = null } = {}) {
  console.log("limt hai y e",limit);
  try {
    const monthYearFilter = parseMonthYear(monthYear);
    const teamObjectId = teamId && mongoose.Types.ObjectId.isValid(teamId)
      ? new mongoose.Types.ObjectId(teamId)
      : null;

    if (teamObjectId) {
      // Start from users in the team and left-join weekly stats
      // Match both ObjectId and string teamId to avoid type mismatch exclusions
      const pipeline = [
        { $match: { $or: [ { teamId: teamObjectId }, { teamId: teamId } ] } },
        {
          $lookup: {
            from: 'userweeklystats',
            localField: '_id',
            foreignField: 'userId',
            as: 'stats'
          }
        },
        { $unwind: { path: '$stats', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'weeklyreports',
            localField: 'stats.weekId',
            foreignField: '_id',
            as: 'week'
          }
        },
        { $unwind: { path: '$week', preserveNullAndEmptyArrays: true } }
      ];

      // Add month/year filter if provided - filter before grouping
      if (monthYearFilter) {
        pipeline.push({
          $match: {
            $or: [
              { stats: { $exists: false } }, // No stats at all
              { week: { $exists: true }, 'week.month': monthYearFilter.month, 'week.year': monthYearFilter.year }
            ]
          }
        });
      }

      // Group by user, summing only the filtered stats
      pipeline.push({
        $group: {
          _id: '$_id',
          fullName: { $first: '$fullName' },
          teamId: { $first: '$teamId' },
          P: { $sum: { $ifNull: ['$stats.P', 0] } },
          A: { $sum: { $ifNull: ['$stats.A', 0] } },
          L: { $sum: { $ifNull: ['$stats.L', 0] } },
          M: { $sum: { $ifNull: ['$stats.M', 0] } },
          S: { $sum: { $ifNull: ['$stats.S', 0] } },
          RGI: { $sum: { $ifNull: ['$stats.RGI', 0] } },
          RGO: { $sum: { $ifNull: ['$stats.RGO', 0] } },
          RRI: { $sum: { $ifNull: ['$stats.RRI', 0] } },
          RRO: { $sum: { $ifNull: ['$stats.RRO', 0] } },
          CON: { $sum: { $ifNull: ['$stats.CON', 0] } },
          TR: { $sum: { $ifNull: ['$stats.TR', 0] } },
          V: { $sum: { $ifNull: ['$stats.V', 0] } },
          oneToOne: { $sum: { $ifNull: ['$stats.oneToOne', 0] } },
          CEU: { $sum: { $ifNull: ['$stats.CEU', 0] } },
          T: { $sum: { $ifNull: ['$stats.T', 0] } },
          TYFCB_amount: { $sum: { $ifNull: ['$stats.TYFCB_amount', 0] } },
          totalPoints: { $sum: { $ifNull: ['$stats.totalPoints', 0] } }
        }
      });

      pipeline.push(
        {
          $lookup: {
            from: 'teams',
            localField: 'teamId',
            foreignField: '_id',
            as: 'team'
          }
        },
        { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            fullName: '$fullName',
            teamName: '$team.name',
            P: { $ifNull: ['$P', 0] },
            A: { $ifNull: ['$A', 0] },
            L: { $ifNull: ['$L', 0] },
            M: { $ifNull: ['$M', 0] },
            S: { $ifNull: ['$S', 0] },
            RGI: { $ifNull: ['$RGI', 0] },
            RGO: { $ifNull: ['$RGO', 0] },
            RRI: { $ifNull: ['$RRI', 0] },
            RRO: { $ifNull: ['$RRO', 0] },
            V: { $ifNull: ['$V', 0] },
            CON: { $ifNull: ['$CON', 0] },
            TR: { $ifNull: ['$TR', 0] },
            oneToOne: { $ifNull: ['$oneToOne', 0] },
            CEU: { $ifNull: ['$CEU', 0] },
            T: { $ifNull: ['$T', 0] },
            TYFCB_amount: { $ifNull: ['$TYFCB_amount', 0] },
            totalPoints: { $ifNull: ['$totalPoints', 0] }
          }
        },
        { $sort: { totalPoints: -1 } }
      );
      return User.aggregate(pipeline);
    }

    // Default: aggregate from stats when no teamId (top performers across all teams)
    const pipeline = [
      {
        $lookup: {
          from: 'weeklyreports',
          localField: 'weekId',
          foreignField: '_id',
          as: 'week'
        }
      },
      { $unwind: '$week' }
    ];

    // Add month/year filter if provided
    if (monthYearFilter) {
      pipeline.push({
        $match: {
          'week.month': monthYearFilter.month,
          'week.year': monthYearFilter.year
        }
      });
    }

    pipeline.push(
      {
        $group: {
          _id: '$userId',
          P: { $sum: '$P' },
          A: { $sum: '$A' },
          L: { $sum: '$L' },
          M: { $sum: '$M' },
          S: { $sum: '$S' },
          RGI: { $sum: '$RGI' },
          RGO: { $sum: '$RGO' },
          RRI: { $sum: '$RRI' },
          RRO: { $sum: '$RRO' },
          CON: { $sum: '$CON' },
          TR: { $sum: '$TR' },
          V: { $sum: '$V' },
          oneToOne: { $sum: '$oneToOne' },
          CEU: { $sum: '$CEU' },
          T: { $sum: '$T' },
          TYFCB_amount: { $sum: '$TYFCB_amount' },
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
          P: 1,
          A: 1,
          L: 1,
          M: 1,
          S: 1,
          RGI: 1,
          RGO: 1,
          RRI: 1,
          RRO: 1,
          V: 1,
          TR: 1,
          CON: 1,
          oneToOne: 1,
          CEU: 1,
          T: 1,
          TYFCB_amount: 1,
          totalPoints: 1
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: limit }
    );
    return UserWeeklyStat.aggregate(pipeline);
  } catch (error) {
    throw error;
  }
}

// Per-team breakdown across all weeks
async function getTeamBreakdown(monthYear = null) {
  try {
    const monthYearFilter = parseMonthYear(monthYear);
    const pipeline = [
      {
        $lookup: {
          from: 'weeklyreports',
          localField: 'weekId',
          foreignField: '_id',
          as: 'week'
        }
      },
      { $unwind: '$week' }
    ];

    // Add month/year filter if provided
    if (monthYearFilter) {
      pipeline.push({
        $match: {
          'week.month': monthYearFilter.month,
          'week.year': monthYearFilter.year
        }
      });
    }

    pipeline.push(
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
        $group: {
          _id: '$team._id',
          teamName: { $first: '$team.name' },

          // ✅ NEW: team members count
          teamMembersCount: { $first: { $size: '$team.users' } },

          P: { $sum: '$P' },
          A: { $sum: '$A' },
          L: { $sum: '$L' },
          M: { $sum: '$M' },
          S: { $sum: '$S' },
          RGI: { $sum: '$RGI' },
          RGO: { $sum: '$RGO' },
          RRI: { $sum: '$RRI' },
          RRO: { $sum: '$RRO' },
          V: { $sum: '$V' },
          CON: { $sum: '$CON' },
          TR: { $sum: '$TR' },
          oneToOne: { $sum: '$oneToOne' },
          CEU: { $sum: '$CEU' },
          T: { $sum: '$T' },
          TYFCB_amount: { $sum: '$TYFCB_amount' },
          totalPoints: { $sum: '$totalPoints' }
        }
      },

      {
        $project: {
          _id: 0,
          teamId: '$_id',
          teamName: 1,
          teamMembersCount: 1, // ✅ expose it
          P: 1,
          A: 1,
          L: 1,
          M: 1,
          S: 1,
          RGI: 1,
          RGO: 1,
          RRI: 1,
          RRO: 1,
          V: 1,
          CON: 1,
          TR: 1,
          oneToOne: 1,
          CEU: 1,
          T: 1,
          TYFCB_amount: 1,
          totalPoints: 1
        }
      },

      { $sort: { totalPoints: -1 } }
    );

    const base = await UserWeeklyStat.aggregate(pipeline);

    // enrich captain name
    const enriched = [];
    for (const t of base) {
      const team = await Team.findById(t.teamId)
        .populate('captainUserId', 'fullName');

      enriched.push({
        ...t,
        captainFullName: team?.captainUserId?.fullName || null
      });
    }

    return enriched;
  } catch (error) {
    throw error;
  }
}

async function getTopTeams(limit = 3, monthYear = null) {
  const stats = await getTeamStats(monthYear);
  const top = stats.slice(0, limit);
  // Enrich with captain name if available
  const enriched = [];
  for (const s of top) {
    const team = await Team.findById(s.teamId).populate('captainUserId', 'fullName');
    enriched.push({
      teamId: s.teamId,
      teamName: s.teamName,
      totalPoints: s.totalPoints,
      captainFullName: team?.captainUserId?.fullName || null
    });
  }
  return enriched;
}

async function getTopPerformers(limit = 3, monthYear = null) {
  try {
    const monthYearFilter = parseMonthYear(monthYear);
    const pipeline = [
      {
        $lookup: {
          from: 'weeklyreports',
          localField: 'weekId',
          foreignField: '_id',
          as: 'week'
        }
      },
      { $unwind: '$week' }
    ];

    // Add month/year filter if provided
    if (monthYearFilter) {
      pipeline.push({
        $match: {
          'week.month': monthYearFilter.month,
          'week.year': monthYearFilter.year
        }
      });
    }

    pipeline.push(
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
    );

    return UserWeeklyStat.aggregate(pipeline);
  } catch (error) {
    throw error;
  }
}

async function getTeamStatsByWeek(monthYear = null) {
  // Useful for charts: points grouped by team and week
  try {
    const monthYearFilter = parseMonthYear(monthYear);
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
    { $unwind: '$week' }
    ];

    // Add month/year filter if provided
    if (monthYearFilter) {
      pipeline.push({
        $match: {
          'week.month': monthYearFilter.month,
          'week.year': monthYearFilter.year
        }
      });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            teamId: '$team._id',
            teamName: '$team.name',
            weekStartDate: '$week.weekStartDate',
            weekEndDate: '$week.weekEndDate'
          },
          totalPoints: { $sum: '$totalPoints' },
          weekStartDate: { $first: '$week.weekStartDate' },
          weekEndDate: { $first: '$week.weekEndDate' }
        }
      },
      {
        $project: {
          _id: 0,
          teamId: '$_id.teamId',
          teamName: '$_id.teamName',
          weekStartDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$weekStartDate" }
          },
          weekEndDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$weekEndDate" }
          },
          totalPoints: 1
        }
      },
      { $sort: { weekStartDate: 1, teamName: 1 } }
    );

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
  getUserTotals,
  getCategoryTotals,
  getUserBreakdown,
  getTeamBreakdown
};


