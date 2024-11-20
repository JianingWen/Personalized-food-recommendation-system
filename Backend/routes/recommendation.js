const express = require('express');
const { getRecommendations } = require('../controllers/recommendation');

const router = express.Router();

// POST route to get food recommendations
router.post('/', getRecommendations);

module.exports = router;
