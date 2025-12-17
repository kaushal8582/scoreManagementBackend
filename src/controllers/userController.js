const { uploadUsersFromFile, listUsers } = require('../services/userService');

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
  getUsers
};


