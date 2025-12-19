const User = require('../models/User');
const WeeklyReport = require('../models/WeeklyReport');
const UserWeeklyStat = require('../models/UserWeeklyStat');
const { parseFileToRows } = require('../utils/csvParser');
const { calculateTotalPoints } = require('../utils/pointsCalculator');
const { getWeekRange } = require('../utils/weekUtils');

/**
 * Upload and process weekly report files (CSV/XLS/XLSX).
 * - Supports multiple files in one request.
 * - Uses provided weekStartDate/weekEndDate if given; else computes from upload date.
 * - Overwrites existing report for the week (removes old stats + report).
 * - Upserts per user per week, aggregating metrics across multiple files.
 */
async function uploadWeeklyReport(files, weekStartDateInput, weekEndDateInput) {
  try {
    console.log("1")
    const uploadDate = new Date();
    let weekStartDate;
    let weekEndDate;

    if (weekStartDateInput && weekEndDateInput) {
      weekStartDate = new Date(weekStartDateInput);
      weekEndDate = new Date(weekEndDateInput);
    } else {
      const range = getWeekRange(uploadDate);
      weekStartDate = range.weekStartDate;
      weekEndDate = range.weekEndDate;
    }
    console.log("2")

    // Overwrite logic: ensure a clean slate for the target week
    const existingWeek = await WeeklyReport.findOne({ weekStartDate, weekEndDate });
    if (existingWeek) {
      await UserWeeklyStat.deleteMany({ weekId: existingWeek._id });
      await WeeklyReport.deleteOne({ _id: existingWeek._id });
    }
    console.log("3")

    const week = await WeeklyReport.create({
      weekStartDate,
      weekEndDate,
      uploadedAt: uploadDate
    });
    console.log("4")

    const skipped = [];
    let processedRows = 0;

    const fileList = Array.isArray(files) ? files : [];
    for (const f of fileList) {
      const rows = parseFileToRows(f.buffer, f.originalname || 'upload');
      for (const row of rows) {
        const firstName = (row['First Name'] || row.firstName || '').trim();
        const lastName = (row['Last Name'] || row.lastName || '').trim();
        if (!firstName || !lastName) {
          skipped.push({ row, reason: 'Missing firstName or lastName' });
          continue;
        }
        console.log("5")

        const fullName = `${firstName} ${lastName}`;
        const user = await User.findOne({ fullName });
        if (!user) {
          skipped.push({ row, reason: 'User not found' });
          continue;
        }

        console.log("6")
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
          TYFCB_amount: Number(row.TYFCB || row.TYFCB_amount || 0),
          CON: Number(row.CON || 0),
          TR: Number(row.TR || 0),
        };

        // Upsert: aggregate metrics per user for the week
        const existingStat = await UserWeeklyStat.findOne({ userId: user._id, weekId: week._id });
        const aggregated = {
          P: (existingStat?.P || 0) + metrics.P,
          A: (existingStat?.A || 0) + metrics.A,
          L: (existingStat?.L || 0) + metrics.L,
          M: (existingStat?.M || 0) + metrics.M,
          S: (existingStat?.S || 0) + metrics.S,
          RGI: (existingStat?.RGI || 0) + metrics.RGI,
          RGO: (existingStat?.RGO || 0) + metrics.RGO,
          RRI: (existingStat?.RRI || 0) + metrics.RRI,
          RRO: (existingStat?.RRO || 0) + metrics.RRO,
          V: (existingStat?.V || 0) + metrics.V,
          oneToOne: (existingStat?.oneToOne || 0) + metrics.oneToOne,
          CEU: (existingStat?.CEU || 0) + metrics.CEU,
          T: (existingStat?.T || 0) + metrics.T,
          TYFCB_amount: (existingStat?.TYFCB_amount || 0) + metrics.TYFCB_amount,
          CON: (existingStat?.CON || 0) + metrics.CON,
          TR: (existingStat?.TR || 0) + metrics.TR,
        };
        console.log("7")

        const totalPoints = calculateTotalPoints(aggregated);
        console.log("dd")

        if (existingStat) {
          existingStat.set({ ...aggregated, totalPoints });
          await existingStat.save();
        } else {
          await UserWeeklyStat.create({
            userId: user._id,
            weekId: week._id,
            ...aggregated,
            totalPoints
          });
        }
        console.log("8")

        processedRows += 1;
      }
    }
    console.log("9")

    return {
      week,
      processedRows,
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


