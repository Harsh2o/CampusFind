import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { Search, MapPin, CheckCircle, ShieldCheck, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="faq-item" onClick={() => setIsOpen(!isOpen)}>
      <div className="faq-question">
        <h4>{question}</h4>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      {isOpen && <div className="faq-answer"><p>{answer}</p></div>}
    </div>
  );
};

const Home = () => {
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/items/recent');
        setRecentItems(res.data);
      } catch (err) {
        console.error('Failed to fetch recent items', err);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="home animate-fade-in">
      
      {/* 1. Hero Section */}
      <section className="hero container">
        <div className="hero-content">
          <h1>Lost Something? Found Something?</h1>
          <p>
            CampusFind is the #1 centralized hub for reconnecting with your lost belongings on campus.
            Join our secure community to make the campus a better place.
          </p>
          <div className="hero-buttons">
            <Link to="/browse" className="btn btn-primary">Browse Items</Link>
            <Link to="/register" className="btn btn-outline">Join Community</Link>
          </div>
        </div>
      </section>

      {/* 2. Live Statistics */}
      <section className="stats bg-light">
        <div className="container stats-container">
          <div className="stat-box">
            <h2>500+</h2>
            <p>Items Recovered</p>
          </div>
          <div className="stat-box">
            <h2>1,200+</h2>
            <p>Active Students</p>
          </div>
          <div className="stat-box">
            <h2>98%</h2>
            <p>Success Rate</p>
          </div>
          <div className="stat-box">
            <h2>24/7</h2>
            <p>Support</p>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="how-it-works container">
        <h2 className="section-title">How It Works</h2>
        <div className="features">
          <div className="feature-card">
            <Search size={40} className="feature-icon" />
            <h3>1. Report & Search</h3>
            <p>Quickly browse through items that have been found or post your own lost item report in seconds.</p>
          </div>
          <div className="feature-card">
            <MapPin size={40} className="feature-icon" />
            <h3>2. Match Location</h3>
            <p>Our smart categorization helps match lost items with found items based on campus locations.</p>
          </div>
          <div className="feature-card">
            <CheckCircle size={40} className="feature-icon" />
            <h3>3. Secure Claiming</h3>
            <p>Safely contact finders using our secure messaging gateway and retrieve your belongings.</p>
          </div>
        </div>
      </section>

      {/* 4. Recent Items Preview */}
      <section className="recent-items bg-light">
        <div className="container">
          <h2 className="section-title">Recently Reported Items</h2>
          <div className="item-grid">
            {recentItems.length > 0 ? recentItems.map(item => (
              <div key={item._id} className="item-card">
                {item.imagePath ? (
                  <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.imagePath}`} alt={item.name} className="item-image" />
                ) : (
                  <div className="item-image-placeholder">No Image</div>
                )}
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <span className="category-badge">{item.itemType === 'lost' ? 'Lost' : 'Found'}</span>
                  <p><strong>Location:</strong> {item.location}</p>
                  <p><strong>Date:</strong> {new Date(item.dateLost || item.dateFound).toLocaleDateString()}</p>
                </div>
              </div>
            )) : <p style={{ textAlign: 'center', width: '100%' }}>No items recently reported.</p>}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/browse" className="btn btn-outline">View All Items</Link>
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us */}
      <section className="why-us container">
        <h2 className="section-title">Why Use CampusFind?</h2>
        <div className="why-grid">
          <div className="why-item">
            <ShieldCheck size={30} className="why-icon" />
            <div>
              <h4>Verified Users Only</h4>
              <p>Only university students and staff can register, keeping the platform secure.</p>
            </div>
          </div>
          <div className="why-item">
            <Clock size={30} className="why-icon" />
            <div>
              <h4>Real-time Updates</h4>
              <p>Get notified instantly when an item matching your description is found.</p>
            </div>
          </div>
          <div className="why-item">
            <Users size={30} className="why-icon" />
            <div>
              <h4>Community Driven</h4>
              <p>Built by students, for students. A supportive campus environment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Success Stories / Testimonials */}
      <section className="testimonials bg-light">
        <div className="container">
          <h2 className="section-title">Success Stories</h2>
          <div className="test-grid">
            <div className="test-card">
              <p>"I lost my AirPods in the library and was sure they were gone forever. Someone posted them on CampusFind and I got them back the next day!"</p>
              <h4>- Sarah J., CS Major</h4>
            </div>
            <div className="test-card">
              <p>"The security features give me peace of mind. I found a wallet and was able to securely verify the owner before handing it over."</p>
              <h4>- Michael T., Campus Security</h4>
            </div>
            <div className="test-card">
              <p>"Way better than posting on random social media groups. The categorization makes finding stuff so much easier."</p>
              <h4>- Elena R., Bio Major</h4>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="faq container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          <FAQItem 
            question="How do I verify ownership of an item?" 
            answer="When you contact a finder, be prepared to describe specific details about the item that aren't visible in the photo, such as the serial number, specific scratches, or the contents (if it's a bag/wallet)."
          />
          <FAQItem 
            question="Is this service free for all students?" 
            answer="Yes! CampusFind is 100% free to use for all registered university students and faculty."
          />
          <FAQItem 
            question="What happens if an item is not claimed?" 
            answer="Items marked as 'Found' that remain unclaimed for over 30 days are automatically handed over to the central Campus Security office."
          />
        </div>
      </section>

    </div>
  );
};

export default Home;
