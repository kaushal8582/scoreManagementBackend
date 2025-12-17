const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadUsersCsv, getUsers } = require('../controllers/userController');

const router = express.Router();
const upload = multer();

router.post('/upload-csv', authMiddleware, upload.single('file'), uploadUsersCsv);
router.get('/', authMiddleware, getUsers);

module.exports = router;


