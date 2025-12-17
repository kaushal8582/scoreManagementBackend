const User = require('../models/User');
const WeeklyReport = require('../models/WeeklyReport');
const UserWeeklyStat = require('../models/UserWeeklyStat');
const { parseFileToRows } = require('../utils/csvParser');
const { calculateTotalPoints } = require('../utils/pointsCalculator');
const { getWeekRange } = require('../utils/weekUtils');

/**
 * Upload and process a weekly report file.
 * - Week is based on upload date
 * - If week exists, delete old WeeklyReport + associated UserWeeklyStat rows
 * - Skip rows for users that don't exist
 * - Returns summary with created stats count and skipped rows
 */
async function uploadWeeklyReport(fileBuffer, originalName) {
 try {
   const uploadDate = new Date();
   const { weekStartDate, weekEndDate } = getWeekRange(uploadDate);
 
   // Overwrite logic: remove existing report for this week
   const existingWeek = await WeeklyReport.findOne({ weekStartDate, weekEndDate });
   if (existingWeek) {
     await UserWeeklyStat.deleteMany({ weekId: existingWeek._id });
     await WeeklyReport.deleteOne({ _id: existingWeek._id });
   }
 
   const week = await WeeklyReport.create({
     weekStartDate,
     weekEndDate,
     uploadedAt: uploadDate
   });
 
   const rows = parseFileToRows(fileBuffer, originalName);
   const skipped = [];
   let created = 0;
 
   for (const row of rows) {
     const firstName = (row['First Name'] || row.firstName || '').trim();
     const lastName = (row['Last Name'] || row.lastName || '').trim();
     if (!firstName || !lastName) {
       skipped.push({ row, reason: 'Missing firstName or lastName' });
       continue;
     }
 
     const fullName = `${firstName} ${lastName}`;
     const user = await User.findOne({ fullName });
     if (!user) {
       skipped.push({ row, reason: 'User not found' });
       continue;
     }
 
     const metrics = {
       P: Number(row.P || 0),
       A: Number(row.A || 0),
       L: Number(row.L || 0),
       M: Number(row.M || 0),
       S: Number(row.S || 0),
       RGI: Number(row.RGI || 0),
       RGO: Number(row.RGO || 0),
       RRI: Number(row.RRI || 0),
       RRO: Number(row.RRO || 0),
       V: Number(row.V || 0),
       oneToOne: Number(row['1-2-1'] || row.oneToOne || 0),
       CEU: Number(row.CEU || 0),
       T: Number(row.T || 0),
       TYFCB_amount: Number(row.TYFCB || row.TYFCB_amount || 0)
     };
 
     const totalPoints = calculateTotalPoints(metrics);
 
     await UserWeeklyStat.create({
       userId: user._id,
       weekId: week._id,
       ...metrics,
       totalPoints
     });
     created += 1;
   }
 
   return {
     week,
     created,
     skipped
   };
 } catch (error) {
   throw error;
 }
}

async function getWeeklyReports() {
  try {
    const reports = await WeeklyReport.find().sort({ weekStartDate: -1 });
    return reports;
  } catch (error) {
    throw error;
  }
}

async function getMonthlyReports() {
  try {
    // Aggregate stats per month (based on weekStartDate)
  const pipeline = [
    {
      $lookup: {
        from: 'userweeklystats',
        localField: '_id',
        foreignField: 'weekId',
        as: 'stats'
      }
    },
    { $unwind: '$stats' },
    {
      $group: {
        _id: {
          year: { $year: '$weekStartDate' },
          month: { $month: '$weekStartDate' }
        },
        totalPoints: { $sum: '$stats.totalPoints' }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 }
    }
  ];

  return WeeklyReport.aggregate(pipeline);
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a weekly report by id and remove associated user weekly stats.
 * Returns a summary of deleted counts.
 */
async function deleteWeeklyReport(weekId) {
  
  try {
    const week = await WeeklyReport.findById(weekId);
    if (!week) {
      const error = new Error('Weekly report not found');
      error.statusCode = 404;
      throw error;
    }
  
    const statsDelete = await UserWeeklyStat.deleteMany({ weekId });
    await WeeklyReport.deleteOne({ _id: weekId });
  
    return {
      deletedWeekId: weekId,
      deletedStats: statsDelete?.deletedCount ?? 0
    };
    
  } catch (error) {
    throw error;
  }
}

module.exports = {
  uploadWeeklyReport,
  getWeeklyReports,
  getMonthlyReports,
  deleteWeeklyReport
};


