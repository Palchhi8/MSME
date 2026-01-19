import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  YAxis
} from 'recharts';
import api from '../api/axios';

const defaultSummary = {
  kpis: { totalRevenue: 0, totalProfit: 0, totalUnits: 0, averageSellingPrice: 0 },
  topProducts: [],
  dailySummary: []
};

const Dashboard = () => {
  const [summary, setSummary] = useState(defaultSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/api/sales/summary');
        setSummary(response.data.analyticsSummary || defaultSummary);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load analytics.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const { kpis, topProducts, dailySummary } = summary;
  const primaryProduct = topProducts?.[0];

  return (
    <section className="card">
      <div className="card-header">
        <h2>Business Dashboard</h2>
        {isLoading && <span className="pill">Loading...</span>}
      </div>
      {error && <p className="status status--error">{error}</p>}
      <div className="kpi-grid">
        <div className="kpi">
          <p>Total Revenue</p>
          <h3>₹ {kpis.totalRevenue?.toFixed?.(2) || '0.00'}</h3>
        </div>
        <div className="kpi">
          <p>Total Profit</p>
          <h3>₹ {kpis.totalProfit?.toFixed?.(2) || '0.00'}</h3>
        </div>
        <div className="kpi">
          <p>Units Sold</p>
          <h3>{kpis.totalUnits || 0}</h3>
        </div>
        <div className="kpi">
          <p>Avg. Selling Price</p>
          <h3>₹ {kpis.averageSellingPrice?.toFixed?.(2) || '0.00'}</h3>
        </div>
      </div>

      <div className="charts">
        <div className="chart">
          <h4>Daily Revenue & Profit</h4>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailySummary}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="key" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="profit" stroke="#16a34a" fillOpacity={0.3} fill="#16a34a" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart">
          <h4>Top Products by Revenue</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="productName" width={120} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#fb923c" radius={[4, 4, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="highlight">
        <h4>Top Product</h4>
        {primaryProduct ? (
          <p>
            {primaryProduct.productName} · Revenue ₹ {primaryProduct.revenue?.toFixed?.(0) || 0} · Units {primaryProduct.units}
          </p>
        ) : (
          <p>No product data yet. Upload your first CSV.</p>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
