import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h3>CampusFind</h3>
          <p style={{ color: 'var(--muted)', lineHeight: '1.6', marginTop: '10px' }}>
            The #1 centralized hub for recovering lost items on campus. Secure, fast, and community-driven.
          </p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/browse">Browse Items</Link></li>
            <li><Link to="/register">Join Community</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Support</h3>
          <ul>
            <li><Link to="/">FAQ</Link></li>
            <li><Link to="/">Contact Us</Link></li>
            <li><Link to="/">Privacy Policy</Link></li>
            <li><Link to="/">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="copyright">
        &copy; {new Date().getFullYear()} CampusFind. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
