import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="navbar glass">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <Search size={24} className="logo-icon" />
          <span>Campus<strong>Find</strong></span>
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/browse">Browse Items</Link>
          {user && (
            <>
              <Link to="/report/lost">Report Lost</Link>
              <Link to="/report/found">Report Found</Link>
              <Link to="/dashboard">My Items</Link>
              <Link to="/messages">Messages</Link>
            </>
          )}
        </nav>

        <div className="nav-auth">
          {user ? (
            <>
              {user.isAdmin && <Link to="/admin" className="btn btn-outline">Admin</Link>}
              <button onClick={logout} className="btn btn-primary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
