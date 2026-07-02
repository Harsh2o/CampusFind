import { useState, useEffect } from 'react';
import api from '../api';
import './Browse.css';
import { Search, Map as MapIcon, Grid } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icons missing issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Browse.jsx needs useNavigate
import { useNavigate } from 'react-router-dom';

const Browse = () => {
  const navigate = useNavigate();
  // ... (keep existing state)
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [activeTab, setActiveTab] = useState('lost');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const queryParams = `?search=${searchQuery}&category=${category}`;
      const [lostRes, foundRes] = await Promise.all([
        api.get(`/items/lost${queryParams}`),
        api.get(`/items/found${queryParams}`)
      ]);
      setLostItems(lostRes.data);
      setFoundItems(foundRes.data);
    } catch (err) {
      console.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category]); // Re-fetch on category change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems(); // Fetch on search form submit
  };

  const items = activeTab === 'lost' ? lostItems : foundItems;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '20px' }}>
      
      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="Search by name, description, or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}><Search size={20} /></button>
        </form>
        
        <select 
          className="category-filter input-field" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Accessories">Accessories</option>
          <option value="Documents">Documents/IDs</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            className={`tab-btn ${activeTab === 'lost' ? 'active' : ''}`}
            onClick={() => setActiveTab('lost')}
          >
            Lost Items
          </button>
          <button 
            className={`tab-btn ${activeTab === 'found' ? 'active' : ''}`}
            onClick={() => setActiveTab('found')}
          >
            Found Items
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewMode('grid')} title="Grid View"><Grid size={20} /></button>
          <button className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setViewMode('map')} title="Map View"><MapIcon size={20} /></button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>Loading items...</div>
      ) : (
        viewMode === 'map' ? (
          <div style={{ height: '600px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
            <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {items.filter(item => item.lat && item.lng).map(item => (
                <Marker key={item._id} position={[item.lat, item.lng]}>
                  <Popup>
                    <strong>{item.name}</strong><br/>
                    {item.location}<br/>
                    <span className="status-badge" style={{marginTop: '5px', display: 'inline-block'}}>{item.itemStatus || 'Reported'}</span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="item-grid">
          {items.map(item => (
            <div key={item._id} className="item-card">
              {item.imagePath ? (
                <img 
                  src={`http://localhost:5000${item.imagePath}`} 
                  alt={item.name} 
                  className="item-image" 
                />
              ) : (
                <div className="item-image-placeholder" style={{ height: '200px', background: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
              )}
              <div className="item-details">
                <h3>{item.name}</h3>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span className="category-badge">{item.category}</span>
                  {(item.itemStatus === 'Recovered' || item.itemStatus === 'Returned') && (
                    <span className="status-badge recovered" style={{ marginBottom: '15px' }}>{item.itemStatus}</span>
                  )}
                </div>
                <p><strong>Location:</strong> {item.location}</p>
                <p><strong>Date:</strong> {new Date(item.dateLost || item.dateFound).toLocaleDateString()}</p>
                {item.description && <p><strong>Desc:</strong> {item.description}</p>}
                
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                  <p><strong>Reported by:</strong> {item.user?.username || 'Anonymous'}</p>
                  <p><strong>Contact:</strong> {item.contactInfo}</p>
                  {item.user && (
                    <button 
                      className="btn btn-outline" 
                      style={{ marginTop: '10px', width: '100%' }}
                      onClick={() => navigate('/messages', { state: { contactUser: item.user } })}
                    >
                      Message {item.user.username}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'white', border: '1px dashed #ccc', borderRadius: '8px' }}>
              <p>No items found matching your search.</p>
            </div>
          )}
        </div>
        )
      )}
    </div>
  );
};

export default Browse;
