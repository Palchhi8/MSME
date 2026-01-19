const { getChatModel } = require('../config/gemini');
const { buildAnalyticsSummary } = require('../utils/analytics');
const { runRuleEngine } = require('../utils/ruleEngine');
const { fetchSales } = require('../utils/salesRepository');
const { buildAiPrompt } = require('../utils/promptBuilder');

const extractInventorySnapshot = (input) => {
  if (!input) return {};
  if (typeof input !== 'object') return {};
  return input;
};

const chatWithAi = async (req, res, next) => {
  try {
    const { query, language, inventorySnapshot, ruleConfig, region } = req.body || {};

    if (!query) {
      return res.status(400).json({ message: 'Query is required.' });
    }

    const sales = await fetchSales(req.user.uid);
    const analyticsSummary = buildAnalyticsSummary(sales);
    const ruleSignals = runRuleEngine({
      analyticsSummary,
      inventorySnapshot: extractInventorySnapshot(inventorySnapshot),
      ruleConfig
    });

    const model = getChatModel();
    const prompt = buildAiPrompt({
      query,
      analyticsSummary,
      ruleSignals,
      language,
      userContext: {
        name: req.user.name || req.user.email,
        region: region || 'India'
      }
    });

    const result = await model.generateContent(prompt);
    const reply = (result && result.response && typeof result.response.text === 'function')
      ? result.response.text()
      : 'Unable to generate response at this time.';

    return res.json({
      reply,
      analyticsSummary,
      ruleSignals
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  chatWithAi
};
