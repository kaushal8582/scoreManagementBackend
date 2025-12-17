const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema(
  {
    weekStartDate: {
      type: Date,
      required: true
    },
    weekEndDate: {
      type: Date,
      required: true
    },
    uploadedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Ensure only one report per week (start/end combination)
weeklyReportSchema.index(
  { weekStartDate: 1, weekEndDate: 1 },
  { unique: true }
);

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);


