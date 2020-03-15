const express = require('express');
const router = express.Router();

// @route GET api/authh
// @desc Test route
// @access Public

router.get('/',(req, res)=> res.send('Auth API'));

module.exports = router