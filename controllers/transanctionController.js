const Transaction = require('../models/transaction');

exports.listTransactions = async (req, res) => {
  try {
    const { month, searchText, page = 1, perPage = 10 } = req.query;
    const query = {};

    // Date filter
    if (month) {
      const startDate = new Date(`2022-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
      query.dateOfSale = { $gte: startDate, $lt: endDate };
    }

    // Search filter
    if (searchText) {
      const searchQuery = { $or: [] };

      // Search by title and description
      const textSearch = { $or: [
        { title: new RegExp(searchText, 'i') },
        { description: new RegExp(searchText, 'i') }
      ]};

      searchQuery.$or.push(textSearch);

      // Search by price (exact match)
      const price = parseFloat(searchText);
      if (!isNaN(price)) {
        searchQuery.$or.push({ price: price });
      }

      Object.assign(query, searchQuery);
    }

    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      transactions,
      total,
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.getStatistics = async (req, res) => {
  try {
    const { month } = req.query;

    // Validate the month parameter
    if (!month || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid month parameter. Expected value is between 1 and 12.' });
    }

    // Parse the month parameter
    const startDate = new Date(`2022-${String(month).padStart(2, '0')}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    const totalSaleAmount = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lt: endDate }, sold: true } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);

    const totalSoldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: startDate, $lt: endDate },
      sold: true,
    });

    const totalNotSoldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: startDate, $lt: endDate },
      sold: false,
    });

    res.status(200).json({
      totalSaleAmount: totalSaleAmount[0]?.total || 0,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getBarChart = async (req, res) => {
  const { month } = req.query;
  const startDate = new Date(`2022-${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + 1);

  const priceRanges = [
    [0, 100], [101, 200], [201, 300], [301, 400], [401, 500],
    [501, 600], [601, 700], [701, 800], [801, 900], [901, Infinity],
  ];

  const priceDistribution = await Promise.all(priceRanges.map(async ([min, max]) => {
    const count = await Transaction.countDocuments({
      dateOfSale: { $gte: startDate, $lt: endDate },
      price: { $gte: min, $lt: max },
    });
    return { range: `${min}-${max}`, count };
  }));

  res.status(200).json(priceDistribution);
};

exports.getPieChart = async (req, res) => {
  const { month } = req.query;
  const startDate = new Date(`2022-${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + 1);

  const categories = await Transaction.aggregate([
    { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  res.status(200).json(categories);
};


