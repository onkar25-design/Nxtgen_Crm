import React, { useState } from 'react'; // Import useState
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd'; // Import DndProvider
import { HTML5Backend } from 'react-dnd-html5-backend'; // Import HTML5Backend
import LoginPage from './components/login/LoginPage';
import SignupPage from './components/login/SignupPage';
import ForgotPasswordPage from './components/login/ForgotPasswordPage';
import ResetPasswordPage from './components/login/ResetPasswordPage';
import Sidebar from './components/sidebar/Sidebar'; // Import the Sidebar component
import LeadsPipeline from './components/leads/LeadsPipeline'; // Import the LeadsPipeline component
import ClientManagement from './components/client/ClientManagement';
import StaffManagement from './components/staff/StaffManagement'; // Import the StaffManagement component
import ActivityLog from './components/activity/ActivityLog'; // Import the ActivityLog component
import Dashboard from './components/dashboard/Dashboard'; // Import the Dashboard component

const App = () => {
  const [userName, setUserName] = useState(localStorage.getItem('userName') || ''); // Retrieve user name from localStorage
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || ''); // Retrieve user role from localStorage
  const location = useLocation(); // Get the current location

  // Define an array of paths where the sidebar should not be displayed
  const noSidebarPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];

  // Check if the current path is a login-related path
  const isLoginPage = noSidebarPaths.includes(location.pathname);

  return (
    <DndProvider backend={HTML5Backend}> {/* Wrap your app with DndProvider */}
      <div style={{ display: 'flex' }}> {/* Flex container for sidebar and main content */}
        {/* Render Sidebar only if the current path is not in noSidebarPaths */}
        {!isLoginPage && <Sidebar userName={userName} userRole={userRole} />} {/* Pass userName and userRole to Sidebar */}
        <div className={`content ${isLoginPage ? 'login-content' : ''}`}> {/* Main content area with class for styling */}
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect root path to login page */}
            <Route path="/login" element={<LoginPage setUserName={setUserName} setUserRole={setUserRole} />} /> {/* Pass setUserName and setUserRole to LoginPage */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/management/leads-pipeline" element={<LeadsPipeline />} /> {/* Add this line */}
            <Route path="/management/clients" element={<ClientManagement />} />
            <Route path="/management/staff" element={<StaffManagement />} /> {/* Add this line */}
            <Route path="/management/activity" element={<ActivityLog />} /> {/* Add this line */}
            <Route path="/dashboard" element={<Dashboard />} /> {/* Add this line for Dashboard route */}
          </Routes>
        </div>
      </div>
    </DndProvider>
  );
};

// Wrap App with Router
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper; // Ensure this is the default export
