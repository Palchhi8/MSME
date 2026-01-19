const { parse } = require('csv-parse/sync');

const REQUIRED_HEADERS = ['productName', 'quantity', 'costPrice', 'sellingPrice', 'date'];

const validateHeaders = (headers) => {
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length) {
    throw new Error(`CSV missing required columns: ${missingHeaders.join(', ')}`);
  }
};

const normalizeNumber = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric value: ${value}`);
  }
  return parsed;
};

const normalizeDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return date.toISOString();
};

const sanitizeRow = (row) => ({
  productName: row.productName?.trim(),
  quantity: normalizeNumber(row.quantity),
  costPrice: normalizeNumber(row.costPrice),
  sellingPrice: normalizeNumber(row.sellingPrice),
  date: normalizeDate(row.date)
});

const parseSalesCsv = (fileBuffer) => {
  try {
    const csvString = fileBuffer.toString('utf8');
    const records = parse(csvString, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (!records.length) {
      throw new Error('CSV contains no rows');
    }

    validateHeaders(Object.keys(records[0]));
    return records.map(sanitizeRow);
  } catch (error) {
    const err = new Error(`Failed to parse CSV: ${error.message}`);
    err.statusCode = 400;
    throw err;
  }
};

module.exports = {
  parseSalesCsv
};
