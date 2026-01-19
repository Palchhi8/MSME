const DEFAULT_RULES = {
  lowStockThreshold: 15,
  fallingProfitDeltaPct: -0.15,
  highPerformerShare: 0.25
};

const normalizeInventorySnapshot = (snapshot = {}) => Object.entries(snapshot).reduce((acc, [productName, value]) => {
  const stock = Number(value);
  if (!Number.isNaN(stock)) {
    acc[productName] = stock;
  }
  return acc;
}, {});

const detectLowStock = (inventorySnapshot, threshold) => {
  const products = Object.entries(inventorySnapshot)
    .filter(([, stock]) => stock <= threshold)
    .map(([productName, stock]) => ({ productName, stock }));

  return {
    status: products.length ? 'alert' : 'ok',
    products
  };
};

const detectFallingProfit = (profitTrend, threshold) => {
  const deltaPct = profitTrend?.deltaPct ?? 0;
  const status = deltaPct <= threshold ? 'alert' : 'ok';

  return {
    status,
    deltaPct
  };
};

const detectHighPerformers = (topProducts, totalRevenue, shareThreshold) => {
  if (!totalRevenue) {
    return { status: 'ok', products: [] };
  }

  const products = topProducts
    .map((product) => ({
      productName: product.productName,
      revenueShare: product.revenue / totalRevenue
    }))
    .filter((product) => product.revenueShare >= shareThreshold);

  return {
    status: products.length ? 'highlight' : 'ok',
    products
  };
};

const runRuleEngine = ({ analyticsSummary, inventorySnapshot = {}, ruleConfig = {} }) => {
  if (!analyticsSummary) {
    throw new Error('analyticsSummary is required for rule engine');
  }

  const config = { ...DEFAULT_RULES, ...ruleConfig };
  const normalizedSnapshot = normalizeInventorySnapshot(inventorySnapshot);

  return {
    lowStock: detectLowStock(normalizedSnapshot, config.lowStockThreshold),
    fallingProfit: detectFallingProfit(analyticsSummary.profitTrend, config.fallingProfitDeltaPct),
    highPerformers: detectHighPerformers(
      analyticsSummary.topProducts,
      analyticsSummary.kpis.totalRevenue,
      config.highPerformerShare
    )
  };
};

module.exports = {
  runRuleEngine,
  DEFAULT_RULES
};
