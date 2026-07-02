import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { TrendingUp, Users, Package } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Admin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, navigate]);

  if (!user || !user.isAdmin) return null;
  if (loading) return <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>Loading Analytics...</div>;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '20px' }}>Admin Analytics Dashboard</h2>
      
      {/* Top Stats Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div className="glass" style={{ flex: 1, minWidth: '200px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '15px', background: '#e7f1ff', borderRadius: '50%', color: '#0056b3' }}><Package size={24} /></div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stats.totals.lost}</h3>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Total Lost Reports</p>
          </div>
        </div>
        <div className="glass" style={{ flex: 1, minWidth: '200px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '15px', background: '#d1e7dd', borderRadius: '50%', color: '#0f5132' }}><Package size={24} /></div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stats.totals.found}</h3>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Total Found Reports</p>
          </div>
        </div>
        <div className="glass" style={{ flex: 1, minWidth: '200px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '50%', color: '#664d03' }}><Users size={24} /></div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stats.totals.users}</h3>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Registered Users</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Line Chart */}
        <div className="glass" style={{ flex: 2, minWidth: '400px', padding: '20px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={20} /> Report Trends (Last 7 Days)
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="lost" stroke="#dc3545" activeDot={{ r: 8 }} name="Lost Reports" />
                <Line type="monotone" dataKey="found" stroke="#198754" name="Found Reports" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass" style={{ flex: 1, minWidth: '300px', padding: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>Items by Category</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.categories}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
