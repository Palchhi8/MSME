import { useMemo, useState } from 'react';
import api from '../api/axios';

const ROLE_OPTIONS = [
  {
    key: 'profitAnalyst',
    label: 'Profit Analyst',
    description: 'Understands margins & cost levers'
  },
  {
    key: 'inventoryManager',
    label: 'Inventory Manager',
    description: 'Keeps shelf stock in control'
  },
  {
    key: 'marketingAdvisor',
    label: 'Marketing Advisor',
    description: 'Plans offers & footfall boosts'
  }
];

const ROLE_LOOKUP = ROLE_OPTIONS.reduce((map, role) => ({ ...map, [role.key]: role }), {});

const parseAiResponse = (text = '') => {
  const sections = { role: '', answer: '', why: '', whatNext: '' };
  if (!text) return sections;

  let currentKey = null;
  text.split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;
    const lower = line.toLowerCase();

    if (lower.startsWith('ai role')) {
      sections.role = line.replace(/ai role:\s*/i, '').trim();
      currentKey = null;
      return;
    }
    if (lower.startsWith('answer')) {
      sections.answer = line.replace(/answer:\s*/i, '').trim();
      currentKey = 'answer';
      return;
    }
    if (lower.startsWith('why')) {
      sections.why = line.replace(/why:\s*/i, '').trim();
      currentKey = 'why';
      return;
    }
    if (lower.startsWith('what next')) {
      sections.whatNext = line.replace(/what next:\s*/i, '').trim();
      currentKey = 'whatNext';
      return;
    }

    if (currentKey) {
      sections[currentKey] = sections[currentKey]
        ? `${sections[currentKey]} ${line}`
        : line;
    }
  });

  return sections;
};

const AIChat = () => {
  const [roleKey, setRoleKey] = useState(ROLE_OPTIONS[0].key);
  const [message, setMessage] = useState('');
  const [aiOutput, setAiOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChat = async (event) => {
    event.preventDefault();
    if (!message.trim()) {
      setError('Please type a question.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setAiOutput(null);
      const payload = {
        query: message.trim(),
        role: roleKey,
        language: 'Hinglish'
      };
      const res = await api.post('/api/ai/chat', payload);
      const parsed = parseAiResponse(res.data.reply);
      const resolvedRoleKey = res.data.role || roleKey;
      setAiOutput({
        roleKey: resolvedRoleKey,
        ...parsed,
        raw: res.data.reply
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reach AI assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeRole = useMemo(() => ROLE_LOOKUP[roleKey] || ROLE_OPTIONS[0], [roleKey]);
  const responseRoleLabel = useMemo(() => {
    if (!aiOutput) return null;
    return aiOutput.role || (ROLE_LOOKUP[aiOutput.roleKey]?.label) || activeRole.label;
  }, [aiOutput, activeRole.label]);

  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AI Business Assistant</p>
          <h2>Role-based advice in plain words</h2>
        </div>
      </div>

      <div className="role-switch">
        {ROLE_OPTIONS.map((roleOption) => (
          <button
            type="button"
            key={roleOption.key}
            className={`role-pill ${roleOption.key === roleKey ? 'role-pill--active' : ''}`}
            onClick={() => setRoleKey(roleOption.key)}
          >
            <span>{roleOption.label}</span>
            <small>{roleOption.description}</small>
          </button>
        ))}
      </div>

      <form onSubmit={handleChat} className="chat-form">
        <label htmlFor="question">Question</label>
        <textarea
          id="question"
          rows="3"
          placeholder="Ask about profits, stock, or marketing..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Ask AI'}
        </button>
      </form>
      {error && <p className="status status--error">{error}</p>}
      {aiOutput && (
        <div className="ai-response-card">
          <p className="ai-response-role">AI Role: {responseRoleLabel}</p>
          <div className="ai-response-section">
            <h4>Answer</h4>
            <p>{aiOutput.answer || 'AI could not find the numbers yet.'}</p>
          </div>
          <div className="ai-response-section">
            <h4>Why</h4>
            <p>{aiOutput.why || 'Need more sales data to explain.'}</p>
          </div>
          <div className="ai-response-section">
            <h4>What Next</h4>
            <p>{aiOutput.whatNext || 'Please upload recent sales to get an action plan.'}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default AIChat;
