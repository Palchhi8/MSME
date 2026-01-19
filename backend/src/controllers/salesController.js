const { parseSalesCsv } = require('../utils/csvParser');
const { buildAnalyticsSummary } = require('../utils/analytics');
const { saveSalesBatch, fetchSales } = require('../utils/salesRepository');

const uploadSales = async (req, res, next) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'CSV file is required under the "file" field.' });
    }

    const rows = parseSalesCsv(req.file.buffer);
    await saveSalesBatch(req.user.uid, rows);

    return res.status(201).json({ message: 'Sales data uploaded successfully', records: rows.length });
  } catch (error) {
    return next(error);
  }
};

const getAllSales = async (req, res, next) => {
  try {
    const sales = await fetchSales(req.user.uid);
    return res.json({ sales });
  } catch (error) {
    return next(error);
  }
};

const getSalesSummary = async (req, res, next) => {
  try {
    const sales = await fetchSales(req.user.uid);
    const analyticsSummary = buildAnalyticsSummary(sales);
    return res.json({ analyticsSummary });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadSales,
  getAllSales,
  getSalesSummary
};
