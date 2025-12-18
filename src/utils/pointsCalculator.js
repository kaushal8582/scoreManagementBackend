/**
 * Calculate total points for a weekly stat row based on business rules.
 * This is a pure function and easily testable.
 *
 * @param {Object} metrics
 * @param {number} metrics.P
 * @param {number} metrics.A
 * @param {number} metrics.L
 * @param {number} metrics.M
 * @param {number} metrics.S
 * @param {number} metrics.RGI
 * @param {number} metrics.RGO
 * @param {number} metrics.RRI
 * @param {number} metrics.RRO
 * @param {number} metrics.V
 * @param {number} metrics.oneToOne
 * @param {number} metrics.CEU
 * @param {number} metrics.T
 * @param {number} metrics.TYFCB_amount
 * @returns {number}
 */
function calculateTotalPoints(metrics) {
  const {
    P = 0,
    A = 0,
    L = 0,
    M = 0,
    S = 0,
    RGI = 0,
    RGO = 0,
    RRI = 0,
    RRO = 0,
    V = 0,
    oneToOne = 0,
    CEU = 0,
    T = 0,
    TYFCB_amount = 0
  } = metrics;

  // New rules:
  // - Present points include Late, Medical, Substitute counts
  // - TYFCB: 1 point per 1000 rupees
  const presentPoints = (P + L + M + S) * 2;
  const absentPoints = A * -2;
  const referralPoints = (RGI + RGO + RRI + RRO) * 5;
  const visitorPoints = V * 10;
  const oneToOnePoints = oneToOne * 5; // "121"
  const testimonialPoints = CEU * 5; // keep same mapping
  const trainingPoints = T * 5;
  const tyfcbPoints = Math.floor(TYFCB_amount / 1000) * 1;

  const total =
    presentPoints +
    absentPoints +
    referralPoints +
    visitorPoints +
    oneToOnePoints +
    testimonialPoints +
    trainingPoints +
    tyfcbPoints;

  return total;
}

module.exports = {
  calculateTotalPoints
};


