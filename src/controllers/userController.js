const { uploadUsersFromFile, listUsers } = require('../services/userService');
const XLSX = require('xlsx');

async function uploadUsersCsv(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }
    const { buffer, originalname } = req.file;
    const result = await uploadUsersFromFile(buffer, originalname);
    return res.status(201).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

async function getUsers(req, res) {
  try {
    const users = await listUsers();
    return res.json(users);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}

module.exports = {
  uploadUsersCsv,
  getUsers,
  downloadSampleXls
};

async function downloadSampleXls(req, res) {
  try {
    const headers = ['First Name', 'Last Name', 'Category'];
    const rows = [
      { 'First Name': 'John', 'Last Name': 'Doe', 'Category': 'P' },
      { 'First Name': 'Jane', 'Last Name': 'Smith', 'Category': 'A' }
    ];

    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xls' });
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', 'attachment; filename="sample-users.xls"');
    return res.status(200).send(buf);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || 'Internal server error' });
  }
}


