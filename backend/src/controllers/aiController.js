const { getChatModel } = require('../config/gemini');
const { buildAnalyticsSummary } = require('../utils/analytics');
const { runRuleEngine } = require('../utils/ruleEngine');
const { fetchSales } = require('../utils/salesRepository');
const { buildAiPrompt, normalizeRole } = require('../utils/promptBuilder');

const extractInventorySnapshot = (input) => {
  if (!input) return {};
  if (typeof input !== 'object') return {};
  return input;
};

const extractRoleToken = (rawQuery = '') => {
  if (typeof rawQuery !== 'string') {
    return { cleanQuery: '', detectedRole: null };
  }

  const match = rawQuery.match(/^\s*\[([^\]]+)\]\s*/i);
  if (!match) {
    return { cleanQuery: rawQuery.trim(), detectedRole: null };
  }

  const cleanQuery = rawQuery.slice(match[0].length).trim();
  return { cleanQuery, detectedRole: match[1] };
};

const chatWithAi = async (req, res, next) => {
  try {
    const { query: rawQuery, language, inventorySnapshot, ruleConfig, region, role: explicitRole } = req.body || {};

    const { cleanQuery, detectedRole } = extractRoleToken(rawQuery);
    if (!cleanQuery) {
      return res.status(400).json({ message: 'Query is required.' });
    }

    const resolvedRole = normalizeRole(explicitRole || detectedRole);

    const sales = await fetchSales(req.user.uid);
    const analyticsSummary = buildAnalyticsSummary(sales);
    const ruleSignals = runRuleEngine({
      analyticsSummary,
      inventorySnapshot: extractInventorySnapshot(inventorySnapshot),
      ruleConfig
    });

    const model = getChatModel();
    const prompt = buildAiPrompt({
      query: cleanQuery,
      analyticsSummary,
      ruleSignals,
      language,
      userContext: {
        name: req.user.name || req.user.email,
        region: region || 'India'
      },
      role: resolvedRole
    });

    const result = await model.generateContent(prompt);
    const reply = (result && result.response && typeof result.response.text === 'function')
      ? result.response.text()
      : 'Unable to generate response at this time.';

    return res.json({
      reply,
      analyticsSummary,
      ruleSignals,
      role: resolvedRole
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  chatWithAi
};
