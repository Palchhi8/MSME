const ROLE_KEYS = {
  PROFIT_ANALYST: 'profitAnalyst',
  INVENTORY_MANAGER: 'inventoryManager',
  MARKETING_ADVISOR: 'marketingAdvisor'
};

const ROLE_ALIASES = {
  analyst: ROLE_KEYS.PROFIT_ANALYST,
  profitanalyst: ROLE_KEYS.PROFIT_ANALYST,
  profit: ROLE_KEYS.PROFIT_ANALYST,
  'profit analyst': ROLE_KEYS.PROFIT_ANALYST,
  inventory: ROLE_KEYS.INVENTORY_MANAGER,
  inventorymanager: ROLE_KEYS.INVENTORY_MANAGER,
  stock: ROLE_KEYS.INVENTORY_MANAGER,
  'inventory manager': ROLE_KEYS.INVENTORY_MANAGER,
  marketing: ROLE_KEYS.MARKETING_ADVISOR,
  marketingadvisor: ROLE_KEYS.MARKETING_ADVISOR,
  advisor: ROLE_KEYS.MARKETING_ADVISOR,
  'marketing advisor': ROLE_KEYS.MARKETING_ADVISOR
};

const ROLE_TEMPLATES = {
  [ROLE_KEYS.PROFIT_ANALYST]: {
    label: 'Profit Analyst',
    responsibilities: 'Explain profit/loss changes, highlight drivers, and suggest pricing or cost moves.',
    actionVerbs: 'Focus on margins, wastage, supplier costs, and simple pricing tweaks.'
  },
  [ROLE_KEYS.INVENTORY_MANAGER]: {
    label: 'Inventory Manager',
    responsibilities: 'Spot low stock, predict demand from trends, and suggest reorder quantities.',
    actionVerbs: 'Talk about stock cover (in days), replenishment urgency, and vendor follow-ups.'
  },
  [ROLE_KEYS.MARKETING_ADVISOR]: {
    label: 'Marketing Advisor',
    responsibilities: 'Plan offers/discounts, pricing hooks, and festival/weekend plans.',
    actionVerbs: 'Mention simple campaigns, WhatsApp promos, or bundle ideas that boost footfall.'
  }
};

const toNumber = (value) => Number(value || 0);
const formatCurrency = (value) => `INR ${toNumber(value).toFixed(0)}`;

const summarizeKpis = (kpis = {}) => {
  const totalRevenue = formatCurrency(kpis.totalRevenue || 0);
  const totalProfit = formatCurrency(kpis.totalProfit || 0);
  const units = kpis.totalUnits || 0;
  const avgPrice = formatCurrency(kpis.averageSellingPrice || 0);
  return `Revenue ${totalRevenue}, profit ${totalProfit}, units ${units}, avg price ${avgPrice}.`;
};

const summarizeTopProducts = (topProducts = []) => {
  if (!topProducts.length) {
    return 'No top products yet.';
  }

  const primary = topProducts[0];
  const followers = topProducts.slice(1)
    .map((product) => `${product.productName} (INR ${(Number(product.revenue || 0)).toFixed(0)})`)
    .join(', ');

  const leadLine = `${primary.productName} leads with revenue ${formatCurrency(primary.revenue || 0)} and units ${primary.units || 0}.`;
  return followers ? `${leadLine} Others: ${followers}.` : leadLine;
};

const summarizeTrends = (analyticsSummary = {}) => {
  const lines = [];
  const daily = analyticsSummary.dailySummary || [];
  const monthly = analyticsSummary.monthlySummary || [];
  if (daily.length) {
    const latestDay = daily[daily.length - 1];
    lines.push(`Latest day ${latestDay.key}: revenue ${formatCurrency(latestDay.revenue)} profit ${formatCurrency(latestDay.profit)}.`);
  }
  if (monthly.length) {
    const latestMonth = monthly[monthly.length - 1];
    lines.push(`Latest month ${latestMonth.key}: revenue ${formatCurrency(latestMonth.revenue)} profit ${formatCurrency(latestMonth.profit)}.`);
  }
  if (analyticsSummary.profitTrend) {
    const pct = (analyticsSummary.profitTrend.deltaPct || 0) * 100;
    lines.push(`Profit trend change ${pct.toFixed(1)}%.`);
  }
  return lines.join(' ');
};

const buildAnalyticsNarrative = (analyticsSummary = {}) => {
  const parts = [
    summarizeKpis(analyticsSummary.kpis),
    summarizeTopProducts(analyticsSummary.topProducts),
    summarizeTrends(analyticsSummary)
  ].filter(Boolean);
  return parts.join(' ');
};

const describeLowStock = (products = []) => {
  if (!products.length) {
    return null;
  }
  const names = products
    .map((product) => `${product.productName} (${product.stock} units, ~2 day cover)`)
    .join(', ');
  return `Stock running low for ${names}. Refill before shelves look empty.`;
};

const describeFallingProfit = (signal = {}) => {
  const pct = ((signal.deltaPct || 0) * 100).toFixed(1);
  if (signal.status !== 'alert') {
    return null;
  }
  return `Profit slipping by ${pct}% week-on-week; check high-cost items and wastage.`;
};

const describeHighPerformers = (products = []) => {
  if (!products.length) {
    return null;
  }
  const names = products
    .map((product) => {
      const share = Number(product.revenueShare || 0) * 100;
      return `${product.productName} (${share.toFixed(0)}% share)`;
    })
    .join(', ');
  return `Hot sellers right now: ${names}. Protect stock and visibility.`;
};

const buildRuleNarrative = (ruleSignals = {}) => {
  const notes = [];
  const lowStockNote = describeLowStock(ruleSignals.lowStock?.products);
  if (lowStockNote) notes.push(lowStockNote);
  const fallingProfitNote = describeFallingProfit(ruleSignals.fallingProfit);
  if (fallingProfitNote) notes.push(fallingProfitNote);
  const highPerformerNote = describeHighPerformers(ruleSignals.highPerformers?.products);
  if (highPerformerNote) notes.push(highPerformerNote);
  return notes.length ? notes.join(' ') : 'No alerts from stock or profit signals today.';
};

const resolveLanguageHint = (language) => {
  if (!language) {
    return 'Respond in English using short, clear sentences.';
  }
  const normalized = language.toLowerCase();
  if (normalized.includes('hinglish')) {
    return 'Respond in Hinglish (mix Hindi + English). Keep words simple, like a local shopkeeper conversation.';
  }
  if (normalized.includes('hindi')) {
    return 'Respond in Hindi with very easy words any Indian shop owner understands.';
  }
  return 'Respond in English using short, clear sentences.';
};

const buildSystemContext = ({ languageHint, userContext }) => (
  `You are "Saathi", an AI business guide for Indian MSME owners with low technical knowledge. ` +
  `Focus on actionable advice, Indian buying patterns (weekends, festivals), and use friendly tone. ${languageHint} ` +
  `Business owner: ${userContext.name || 'Unknown owner'}, region: ${userContext.region || 'India'}.`
);

const buildRoleDirective = (roleKey) => {
  const template = ROLE_TEMPLATES[roleKey] || ROLE_TEMPLATES[ROLE_KEYS.PROFIT_ANALYST];
  return `Current role: ${template.label}. ${template.responsibilities} ${template.actionVerbs}`;
};

const buildResponseFormat = (hasData, roleLabel) => {
  const dataHint = hasData
    ? 'Use available numbers. Keep Answer/Why/What Next to 1-2 short sentences each.'
    : 'Data is limited; clearly state that more sales uploads are needed before advising.';
  return `${dataHint} Format output exactly as:
AI Role: ${roleLabel}
Answer: <direct reply>
Why: <reason in plain words>
What Next: <specific next step>`;
};

const hasUsableData = (analyticsSummary = {}) => {
  const hasTotals = (analyticsSummary.kpis?.totalUnits || 0) > 0;
  const hasTrends = Boolean(analyticsSummary.dailySummary?.length || analyticsSummary.monthlySummary?.length);
  return hasTotals || hasTrends;
};

const normalizeRole = (roleInput) => {
  if (!roleInput || typeof roleInput !== 'string') {
    return ROLE_KEYS.PROFIT_ANALYST;
  }
  const cleaned = roleInput.trim().toLowerCase();
  const compact = cleaned.replace(/\s+/g, '');
  if (ROLE_ALIASES[cleaned]) return ROLE_ALIASES[cleaned];
  if (ROLE_ALIASES[compact]) return ROLE_ALIASES[compact];
  if (Object.values(ROLE_KEYS).includes(roleInput)) {
    return roleInput;
  }
  return ROLE_KEYS.PROFIT_ANALYST;
};

const buildAiPrompt = ({
  query,
  analyticsSummary,
  ruleSignals,
  language,
  userContext = {},
  role = ROLE_KEYS.PROFIT_ANALYST
}) => {
  const languageHint = resolveLanguageHint(language);
  const systemContext = buildSystemContext({ languageHint, userContext }); // Step 1: system context
  const roleDirective = buildRoleDirective(role);
  const roleLabel = (ROLE_TEMPLATES[role] || ROLE_TEMPLATES[ROLE_KEYS.PROFIT_ANALYST]).label;
  const analyticsNarrative = buildAnalyticsNarrative(analyticsSummary);
  const ruleNarrative = buildRuleNarrative(ruleSignals);
  const responseFormat = buildResponseFormat(hasUsableData(analyticsSummary), roleLabel);

  return `${systemContext}
${roleDirective}

Business snapshot:
${analyticsNarrative}

Alerts:
${ruleNarrative}

User question:
${query}

${responseFormat}
Do not mention rules or internal systems. Never say "based on provided data" or "as an AI". Keep tone friendly and confident.`;
};

module.exports = {
  buildAiPrompt,
  ROLE_KEYS,
  normalizeRole
};
