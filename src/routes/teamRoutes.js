const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createTeamController,
  getTeamsController,
  updateTeamController,
  deleteTeamController
} = require('../controllers/teamController');

const router = express.Router();

router.post('/', authMiddleware, createTeamController);
router.get('/', authMiddleware, getTeamsController);
router.put('/:id', authMiddleware, updateTeamController);
router.delete('/:id', authMiddleware, deleteTeamController);


module.exports = router;


