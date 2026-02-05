const express = require("express");

const authMiddleware = require('../middleware/authMiddleware');

const {getAllForm,createForm} = require("../controllers/formController");

const router = express.Router();

router.post('/',authMiddleware,createForm);
router.get('/',authMiddleware,getAllForm);




module.exports = router;


