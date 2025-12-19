const mongoose = require('mongoose');

const userWeeklyStatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    weekId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeeklyReport',
      required: true
    },
    P: { type: Number, default: 0 },
    A: { type: Number, default: 0 },
    L: { type: Number, default: 0 },
    M: { type: Number, default: 0 },
    S: { type: Number, default: 0 },
    RGI: { type: Number, default: 0 },
    RGO: { type: Number, default: 0 },
    RRI: { type: Number, default: 0 },
    RRO: { type: Number, default: 0 },
    V: { type: Number, default: 0 },
    oneToOne: { type: Number, default: 0 },
    TYFCB_amount: { type: Number, default: 0 },
    CEU: { type: Number, default: 0 },
    TR :{ type: Number, default: 0 },
    T: { type: Number, default: 0 },
    CON : { type: Number, default: 0 },
    totalPoints: { type: Number, required: true }
  },
  { timestamps: true }
);

userWeeklyStatSchema.index({ userId: 1, weekId: 1 }, { unique: true });

module.exports = mongoose.model('UserWeeklyStat', userWeeklyStatSchema);


