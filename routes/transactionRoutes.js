const express = require('express');
const {
  listTransactions,
  getStatistics,
  getBarChart,
  getPieChart,
  getCombinedData,
} = require('../controllers/transanctionController');
const {initializeDatabase} = require('../controllers/initController')
const router = express.Router();

router.get('/transactions/init', initializeDatabase);
router.get('/transactions', listTransactions);
router.get('/statistics', getStatistics);
router.get('/bar-chart', getBarChart);
router.get('/pie-chart', getPieChart);

module.exports = router;
