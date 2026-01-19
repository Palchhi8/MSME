const toNumber = (value) => {
  const normalized = Number(value);
  if (Number.isNaN(normalized)) {
    throw new Error(`Invalid numeric value provided to analytics: ${value}`);
  }
  return normalized;
};

const normalizeSale = (sale) => ({
  productName: sale.productName,
  quantity: toNumber(sale.quantity),
  costPrice: toNumber(sale.costPrice),
  sellingPrice: toNumber(sale.sellingPrice),
  date: sale.date || new Date().toISOString()
});

const computeFinancials = (sale) => {
  const revenue = sale.quantity * sale.sellingPrice;
  const cost = sale.quantity * sale.costPrice;
  const profit = revenue - cost;
  return { revenue, cost, profit };
};

const formatDayKey = (isoDate) => isoDate.split('T')[0];

const formatMonthKey = (isoDate) => {
  const date = new Date(isoDate);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const aggregateByKey = (sales, keyFn) => {
  const map = {};
  sales.forEach((sale) => {
    const key = keyFn(sale.date);
    const { revenue, profit } = computeFinancials(sale);
    const existing = map[key] || { revenue: 0, profit: 0, units: 0 };
    map[key] = {
      revenue: existing.revenue + revenue,
      profit: existing.profit + profit,
      units: existing.units + sale.quantity
    };
  });
  return map;
};

const toSortedArray = (dataMap, dateParser) => Object.entries(dataMap)
  .sort(([a], [b]) => dateParser(a) - dateParser(b))
  .map(([key, data]) => ({ key, ...data }));

const calculateKpis = (sales) => {
  const base = { totalRevenue: 0, totalCost: 0, totalProfit: 0, totalUnits: 0 };
  const totals = sales.reduce((acc, sale) => {
    const { revenue, cost, profit } = computeFinancials(sale);
    return {
      totalRevenue: acc.totalRevenue + revenue,
      totalCost: acc.totalCost + cost,
      totalProfit: acc.totalProfit + profit,
      totalUnits: acc.totalUnits + sale.quantity
    };
  }, base);

  return {
    ...totals,
    averageSellingPrice: totals.totalUnits ? totals.totalRevenue / totals.totalUnits : 0,
    averageProfitPerUnit: totals.totalUnits ? totals.totalProfit / totals.totalUnits : 0
  };
};

const getTopSellingProducts = (sales, limit = 5) => {
  const map = {};
  sales.forEach((sale) => {
    const { revenue, profit } = computeFinancials(sale);
    const existing = map[sale.productName] || { revenue: 0, profit: 0, units: 0 };
    map[sale.productName] = {
      revenue: existing.revenue + revenue,
      profit: existing.profit + profit,
      units: existing.units + sale.quantity
    };
  });

  return Object.entries(map)
    .map(([productName, metrics]) => ({ productName, ...metrics }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

const calculateProfitTrend = (dailySummary, window = 7) => {
  if (!dailySummary.length) {
    return { currentProfit: 0, previousProfit: 0, delta: 0, deltaPct: 0 };
  }

  const sorted = [...dailySummary].sort((a, b) => new Date(a.key) - new Date(b.key));
  const currentWindow = sorted.slice(-window);
  const previousWindow = sorted.slice(-window * 2, -window);

  const sumProfit = (entries) => entries.reduce((acc, entry) => acc + entry.profit, 0);

  const currentProfit = sumProfit(currentWindow);
  const previousProfit = sumProfit(previousWindow);
  const delta = currentProfit - previousProfit;
  const deltaPct = previousProfit === 0 ? (currentProfit ? 1 : 0) : delta / previousProfit;

  return { currentProfit, previousProfit, delta, deltaPct };
};

const buildAnalyticsSummary = (rawSales = []) => {
  const sales = rawSales.map(normalizeSale);
  const kpis = calculateKpis(sales);

  const dailyMap = aggregateByKey(sales, formatDayKey);
  const monthlyMap = aggregateByKey(sales, formatMonthKey);

  const dailySummary = toSortedArray(dailyMap, (key) => new Date(key));
  const monthlySummary = toSortedArray(monthlyMap, (key) => new Date(`${key}-01`));

  return {
    kpis,
    topProducts: getTopSellingProducts(sales),
    dailySummary,
    monthlySummary,
    profitTrend: calculateProfitTrend(dailySummary)
  };
};

module.exports = {
  calculateKpis,
  getTopSellingProducts,
  buildAnalyticsSummary,
  calculateProfitTrend
};
