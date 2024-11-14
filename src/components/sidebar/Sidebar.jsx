import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsersCog, 
  faSignOutAlt, 
  faChevronDown, 
  faClipboardList, 
  faUser,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

function Sidebar({ userName, userRole }) {
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.nxtgen-sidebar') && 
          !event.target.closest('.nxtgen-mobile-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <button 
        className="nxtgen-mobile-toggle"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
      </button>

      <div className={`nxtgen-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />

      <div className={`nxtgen-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="nxtgen-logo-space">
          <h1 className="nxtgen-logo">
            <span className="nxtgen-green">Nxt</span>
            <span className="nxtgen-white">Gen</span>
          </h1>
        </div>

        <div className="nxtgen-user-info">
          <div className="nxtgen-user-icon-container">
            <FontAwesomeIcon icon={faUser} className="nxtgen-user-icon" />
          </div>
          <div className="nxtgen-user-details">
            {userName && <h3 className="nxtgen-user-name">{userName}</h3>}
            {userRole && <h4 className="nxtgen-user-role">{userRole}</h4>}
          </div>
        </div>

        <div className="nxtgen-divider" />

        <nav>
          <Link 
            to="/dashboard" 
            className={`nxtgen-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faHome} className="nxtgen-icon" />
            <span className="nxtgen-nav-text">Home</span>
          </Link>

          <div 
            className={`nxtgen-nav-item ${
              (location.pathname.startsWith('/management') && 
               location.pathname !== '/management/activity') ? 'active' : ''
            }`}
            onClick={() => setIsManagementOpen(!isManagementOpen)}
          >
            <FontAwesomeIcon icon={faUsersCog} className="nxtgen-icon" />
            <span className="nxtgen-nav-text">Management</span>
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className={`nxtgen-icon-arrow ${isManagementOpen ? 'open' : ''}`}
              style={{ marginLeft: 'auto' }} 
            />
          </div>

          {isManagementOpen && (
            <div className="nxtgen-sub-menu">
              <Link 
                to="/management/leads-pipeline"
                className={`nxtgen-nav-item nxtgen-sub-item ${
                  location.pathname === '/management/leads-pipeline' ? 'active' : ''
                }`}
              >
                <span className="nxtgen-nav-text">Leads Pipeline</span>
              </Link>
              <Link 
                to="/management/clients"
                className={`nxtgen-nav-item nxtgen-sub-item ${
                  location.pathname === '/management/clients' ? 'active' : ''
                }`}
              >
                <span className="nxtgen-nav-text">Clients</span>
              </Link>
              <Link 
                to="/management/staff"
                className={`nxtgen-nav-item nxtgen-sub-item ${
                  location.pathname === '/management/staff' ? 'active' : ''
                }`}
              >
                <span className="nxtgen-nav-text">Staff</span>
              </Link>
            </div>
          )}

          <Link 
            to="/management/activity"
            className={`nxtgen-nav-item ${location.pathname === '/management/activity' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faClipboardList} className="nxtgen-icon" />
            <span className="nxtgen-nav-text">Activity</span>
          </Link>

          <Link 
            to="/login"
            className="nxtgen-nav-item"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="nxtgen-icon" />
            <span className="nxtgen-nav-text">Logout</span>
          </Link>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;