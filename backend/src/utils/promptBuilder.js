const stringifyNumber = (value) => Number(value || 0).toFixed(2);

const summarizeKpis = (kpis = {}) => [
  `Total revenue (INR): ${stringifyNumber(kpis.totalRevenue)}`,
  `Total profit (INR): ${stringifyNumber(kpis.totalProfit)}`,
  `Total units sold: ${kpis.totalUnits || 0}`,
  `Average selling price (INR): ${stringifyNumber(kpis.averageSellingPrice)}`,
  `Average profit per unit (INR): ${stringifyNumber(kpis.averageProfitPerUnit)}`
];

const summarizeTopProducts = (topProducts = []) => {
  if (!topProducts.length) {
    return ['No standout products recorded yet.'];
  }

  return topProducts.map((product, idx) => {
    const revenue = stringifyNumber(product.revenue || 0);
    const profit = stringifyNumber(product.profit || 0);
    const units = Number(product.units || 0);
    return `${idx + 1}. ${product.productName} | revenue ${revenue} | profit ${profit} | units ${units}`;
  });
};

const summarizeRuleSignals = (ruleSignals = {}) => {
  const sections = [];

  if (ruleSignals.lowStock) {
    const { status, products = [] } = ruleSignals.lowStock;
    sections.push(`Low stock status: ${status}${products.length ? ` | products: ${products.map((p) => `${p.productName}(${p.stock})`).join(', ')}` : ''}`);
  }

  if (ruleSignals.fallingProfit) {
    const { status, deltaPct = 0 } = ruleSignals.fallingProfit;
    sections.push(`Profit momentum: ${status} | change ${(deltaPct * 100).toFixed(1)}%`);
  }

  if (ruleSignals.highPerformers) {
    const { status, products = [] } = ruleSignals.highPerformers;
    sections.push(`High performers: ${status}${products.length ? ` | leaders: ${products.map((p) => `${p.productName}(${(p.revenueShare * 100).toFixed(1)}%)`).join(', ')}` : ''}`);
  }

  return sections;
};

const summarizeAnalytics = (analyticsSummary = {}) => {
  const lines = [
    'KPIs:',
    ...summarizeKpis(analyticsSummary.kpis),
    'Top products:',
    ...summarizeTopProducts(analyticsSummary.topProducts)
  ];

  if (analyticsSummary.dailySummary?.length) {
    const latestDay = analyticsSummary.dailySummary.at(-1);
    lines.push(`Latest day (${latestDay.key}) revenue ${stringifyNumber(latestDay.revenue)} | profit ${stringifyNumber(latestDay.profit)}`);
  }

  if (analyticsSummary.monthlySummary?.length) {
    const latestMonth = analyticsSummary.monthlySummary.at(-1);
    lines.push(`Latest month (${latestMonth.key}) revenue ${stringifyNumber(latestMonth.revenue)} | profit ${stringifyNumber(latestMonth.profit)}`);
  }

  if (analyticsSummary.profitTrend) {
    const trend = analyticsSummary.profitTrend;
    lines.push(`Profit trend delta ${(trend.deltaPct * 100).toFixed(1)}% compared to previous window.`);
  }

  return lines;
};

const resolveLanguageHint = (language) => {
  if (!language) return 'Respond in English, but keep sentences simple.';
  const normalized = language.toLowerCase();
  if (normalized.includes('hinglish')) {
    return 'Respond in Hinglish (mix of Hindi and English) using simple words.';
  }
  if (normalized.includes('hindi')) {
    return 'Respond in Hindi with very easy vocabulary understandable by MSME owners.';
  }
  return 'Respond in English, but keep sentences simple.';
};

const buildAiPrompt = ({
  query,
  analyticsSummary,
  ruleSignals,
  language,
  userContext = {}
}) => {
  const analyticsLines = summarizeAnalytics(analyticsSummary).join('\n');
  const ruleLines = summarizeRuleSignals(ruleSignals).join('\n');
  const languageHint = resolveLanguageHint(language);

  return `You are the MSME AI Business Manager helping small Indian businesses.\nRoles:\n1. Profit Analyst - explain drivers of profits.\n2. Inventory Manager - monitor stock risks.\n3. Marketing Advisor - suggest simple growth experiments.\nAlways explain WHY the numbers look this way and WHAT NEXT actions to take.\nUse culturally aware context (Indian weekends, local purchasing patterns).\nNever overwhelm with jargon.\n${languageHint}\n\nBusiness context: owner=${userContext.name || 'Unknown owner'}, region=${userContext.region || 'India'}.\nAnalytics summary:\n${analyticsLines}\n\nRule signals:\n${ruleLines}\n\nUser query:\n${query}\n\nCraft a concise response with headings: Insights, What Next, Friendly Reminder.`;
};

module.exports = {
  buildAiPrompt
};
