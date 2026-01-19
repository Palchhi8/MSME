import { useState } from 'react';
import api from '../api/axios';

const ROLES = ['Profit Analyst', 'Inventory Manager', 'Marketing Advisor'];

const AIChat = () => {
  const [role, setRole] = useState(ROLES[0]);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
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
      setResponse('');
      const payload = {
        query: `[${role}] ${message}`,
        language: 'Hinglish'
      };
      const res = await api.post('/api/ai/chat', payload);
      setResponse(res.data.reply || 'AI did not return a response.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reach AI assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>AI Business Coach</h2>
      <form onSubmit={handleChat} className="chat-form">
        <label htmlFor="role">Select Role</label>
        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((item) => (
            <option value={item} key={item}>{item}</option>
          ))}
        </select>
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
      {response && (
        <div className="chat-response">
          <h4>AI Response</h4>
          <p>{response}</p>
        </div>
      )}
    </section>
  );
};

export default AIChat;
