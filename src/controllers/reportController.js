const {
  uploadWeeklyReport,
  getWeeklyReports,
  getMonthlyReports,
  deleteWeeklyReport
} = require('../services/reportService');

async function uploadWeeklyReportController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }
    const { buffer, originalname } = req.file;
    const result = await uploadWeeklyReport(buffer, originalname);
    return res.status(201).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

async function getWeeklyReportsController(req, res) {
  try {
    const reports = await getWeeklyReports();
    return res.json(reports);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

async function getMonthlyReportsController(req, res) {
  try {
    const reports = await getMonthlyReports();
    return res.json(reports);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

module.exports = {
  uploadWeeklyReportController,
  getWeeklyReportsController,
  getMonthlyReportsController,
  deleteWeeklyReportController
};

async function deleteWeeklyReportController(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteWeeklyReport(id);
    return res.json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}


