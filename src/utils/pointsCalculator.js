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

  const tyfcbPoints = Math.floor(TYFCB_amount / 1000) * 5;

  const total =
    P * 2 +
    A * -2 +
    L * 0 +
    M * 2 +
    S * 2 +
    (RGI + RGO + RRI + RRO) * 5 +
    V * 10 +
    oneToOne * 5 +
    CEU * 5 +
    T * 5 +
    tyfcbPoints;

  return total;
}

module.exports = {
  calculateTotalPoints
};


