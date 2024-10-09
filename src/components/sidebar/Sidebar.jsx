import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsersCog, faSignOutAlt, faChevronDown } from '@fortawesome/free-solid-svg-icons'; // Import Font Awesome icons
import './Sidebar.css';
import companyLogo from './company-logo.png'; // Adjust the path to your logo

function Sidebar() {
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = () => {
    // Perform any logout logic here (e.g., clearing tokens)
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="nxtgen-sidebar">
      <div className="nxtgen-logo-space">
        <img src={companyLogo} alt="Company Logo" className="nxtgen-company-logo" />
      </div>
      <nav>
        <div className="nxtgen-nav-item">
          <FontAwesomeIcon icon={faHome} className="nxtgen-icon" />
          Home
        </div>
        <div className="nxtgen-nav-item" onClick={() => setIsManagementOpen(!isManagementOpen)}>
          <FontAwesomeIcon icon={faUsersCog} className="nxtgen-icon" />
          Management
          <FontAwesomeIcon icon={faChevronDown} className="nxtgen-icon-arrow" style={{ marginLeft: 'auto' }} />
        </div>
        {isManagementOpen && (
          <div className="nxtgen-sub-menu">
            <Link to="/management/leads-pipeline" className="nxtgen-nav-item nxtgen-sub-item">
              <span className="nxtgen-bullet"></span>
              Leads Pipeline
            </Link>
          </div>
        )}
        <div className="nxtgen-nav-item" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="nxtgen-icon" />
          Logout
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;