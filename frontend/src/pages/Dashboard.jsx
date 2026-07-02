import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const res = await api.get('/items/my-items');
        setMyItems(res.data);
      } catch (err) {
        console.error('Failed to fetch items', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyItems();
  }, [user]);

  const handleStatusChange = async (type, id, currentStatus) => {
    const newStatus = currentStatus === 'Recovered' || currentStatus === 'Returned' ? 'Unclaimed' : 'Recovered';
    try {
      const res = await api.put(`/items/${type}/${id}`, { status: newStatus });
      // Update local state
      setMyItems(myItems.map(item => item._id === id ? { ...item, itemStatus: newStatus } : item));
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await api.delete(`/items/${type}/${id}`);
        setMyItems(myItems.filter(item => item._id !== id));
      } catch (err) {
        console.error('Delete failed', err);
      }
    }
  };

  if (!user) return <div className="container" style={{marginTop: '4rem'}}>Please login to view your dashboard.</div>;
  if (loading) return <div className="container" style={{marginTop: '4rem', textAlign:'center'}}>Loading your dashboard...</div>;

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {user.username}!</h2>
        <p>Manage your reported lost and found items.</p>
      </div>

      <div className="dashboard-grid">
        {myItems.length > 0 ? myItems.map(item => (
          <div key={item._id} className="dash-card">
            <div className="dash-card-header">
              <h3>{item.name}</h3>
              <span className={`status-badge ${item.itemStatus === 'Recovered' || item.itemStatus === 'Returned' ? 'recovered' : ''}`}>
                {item.itemStatus || (item.itemType === 'lost' ? 'Lost' : 'Unclaimed')}
              </span>
            </div>
            <div className="dash-card-body">
              <p><strong>Type:</strong> {item.itemType === 'lost' ? 'Lost Report' : 'Found Report'}</p>
              <p><strong>Date:</strong> {new Date(item.dateLost || item.dateFound).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {item.location}</p>
            </div>
            <div className="dash-card-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => handleStatusChange(item.itemType, item._id, item.itemStatus)}
              >
                Mark {item.itemStatus === 'Recovered' || item.itemStatus === 'Returned' ? 'Unclaimed' : 'Recovered'}
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(item.itemType, item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        )) : (
          <div className="empty-state">
            <p>You haven't reported any items yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
