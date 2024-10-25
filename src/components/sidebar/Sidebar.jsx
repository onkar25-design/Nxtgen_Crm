import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsersCog, faSignOutAlt, faChevronDown, faClipboardList, faTachometerAlt } from '@fortawesome/free-solid-svg-icons'; // Import Font Awesome icons
import './Sidebar.css';

function Sidebar() {
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation(); // Get the current location

  const handleLogout = () => {
    // Perform any logout logic here (e.g., clearing tokens)
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="nxtgen-sidebar">
      <div className="nxtgen-logo-space">
        <h1 className="nxtgen-logo">
          <span className="nxtgen-green">Nxt</span>
          <span className="nxtgen-white">Gen</span>
        </h1>
      </div>
      <nav>
      <Link to="/dashboard" className={`nxtgen-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <FontAwesomeIcon icon={faHome} className="nxtgen-icon" />
          <span className="nxtgen-nav-text">Home</span>
        </Link>
        <div className="nxtgen-nav-item" onClick={() => setIsManagementOpen(!isManagementOpen)}>
          <FontAwesomeIcon icon={faUsersCog} className="nxtgen-icon" />
          <span className="nxtgen-nav-text">Management</span>
          <FontAwesomeIcon icon={faChevronDown} className="nxtgen-icon-arrow" style={{ marginLeft: 'auto' }} />
        </div>
        {isManagementOpen && (
          <div className="nxtgen-sub-menu">
            <Link to="/management/leads-pipeline" className={`nxtgen-nav-item nxtgen-sub-item ${location.pathname === '/management/leads-pipeline' ? 'active' : ''}`}>
              <span className="nxtgen-nav-text">Leads Pipeline</span>
            </Link>
            <Link to="/management/clients" className={`nxtgen-nav-item nxtgen-sub-item ${location.pathname === '/management/clients' ? 'active' : ''}`}>
              <span className="nxtgen-nav-text">Clients</span>
            </Link>
            <Link to="/management/staff" className={`nxtgen-nav-item nxtgen-sub-item ${location.pathname === '/management/staff' ? 'active' : ''}`}>
              <span className="nxtgen-nav-text">Staff</span>
            </Link>
          </div>
        )}
        <Link to="/management/activity" className={`nxtgen-nav-item nxtgen-sub-item ${location.pathname === '/management/activity' ? 'active' : ''}`}>
          <FontAwesomeIcon icon={faClipboardList} className="nxtgen-icon" />
          <span className="nxtgen-nav-text">Activity</span>
        </Link>
       
        <div className="nxtgen-nav-item" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="nxtgen-icon" />
          <span className="nxtgen-nav-text">Logout</span>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
