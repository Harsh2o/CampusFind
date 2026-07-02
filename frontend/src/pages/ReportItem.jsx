import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icons missing issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const ReportItem = () => {
  const { type } = useParams(); // 'lost' or 'found'
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(null);
  const [matches, setMatches] = useState([]); // Add state for smart matches
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    date: '',
    location: '',
    description: '',
    contactInfo: '',
    itemStatus: 'Unclaimed'
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append(type === 'lost' ? 'dateLost' : 'dateFound', formData.date);
    data.append('location', formData.location);
    data.append('description', formData.description);
    data.append('contactInfo', formData.contactInfo);
    if (type === 'found') data.append('itemStatus', formData.itemStatus);
    if (image) data.append('image', image);
    if (position) {
      data.append('lat', position.lat);
      data.append('lng', position.lng);
    }

    try {
      const res = await api.post(`/items/${type}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // If smart matches found, show them instead of navigating immediately
      if (res.data.matches && res.data.matches.length > 0) {
        setMatches(res.data.matches);
      } else {
        alert('Report submitted successfully!');
        navigate('/browse');
      }
    } catch (error) {
      console.error(error);
      alert('Error reporting item');
    } finally {
      setLoading(false);
    }
  };

  // If matches found, display match screen
  if (matches.length > 0) {
    return (
      <div className="container animate-fade-in" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <h2>🎉 Potential Matches Found!</h2>
        <p>We found some items that might belong to you. Take a look before creating a new request.</p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          {matches.map(m => (
            <div key={m._id} className="glass" style={{ padding: '20px', maxWidth: '300px' }}>
              <h4>{m.name}</h4>
              <p>{m.location}</p>
              <p style={{ color: 'var(--muted)' }}>{m.description}</p>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/browse')}>Go to Browse Items</button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      <div className="glass" style={{ padding: '2rem', width: '100%', maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          Report {type === 'lost' ? 'Lost' : 'Found'} Item
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Item Name</label>
            <input name="name" type="text" className="input-field" onChange={handleChange} required />
          </div>
          
          <div className="input-group">
            <label>Category</label>
            <select name="category" className="input-field" onChange={handleChange} required defaultValue="">
              <option value="" disabled>Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Accessories">Accessories</option>
              <option value="Documents">Documents/IDs</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="input-group">
            <label>Date {type === 'lost' ? 'Lost' : 'Found'}</label>
            <input name="date" type="date" className="input-field" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Location (Description)</label>
            <input name="location" type="text" className="input-field" onChange={handleChange} required />
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label>Pin Location on Map (Optional)</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '10px' }}>Click on the map to place a pin where the item was {type === 'lost' ? 'lost' : 'found'}.</p>
            <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
              <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea name="description" className="input-field" rows="3" onChange={handleChange}></textarea>
          </div>

          <div className="input-group">
            <label>Contact Info (Email/Phone)</label>
            <input name="contactInfo" type="text" className="input-field" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Upload Image</label>
            <input type="file" className="input-field" onChange={handleImageChange} accept="image/*" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
