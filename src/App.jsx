import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { DndProvider } from 'react-dnd'; // Import DndProvider
import { HTML5Backend } from 'react-dnd-html5-backend'; // Import HTML5Backend
import LoginPage from './components/login/LoginPage';
import SignupPage from './components/login/SignupPage';
import ForgotPasswordPage from './components/login/ForgotPasswordPage';
import ResetPasswordPage from './components/login/ResetPasswordPage';
import Sidebar from './components/sidebar/Sidebar'; // Import the Sidebar component
import LeadsPipeline from './components/leads/LeadsPipeline'; // Import the LeadsPipeline component

const App = () => {
  const location = useLocation(); // Get the current location

  // Define an array of paths where the sidebar should not be displayed
  const noSidebarPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];

  // Check if the current path is a login-related path
  const isLoginPage = noSidebarPaths.includes(location.pathname);

  return (
    <DndProvider backend={HTML5Backend}> {/* Wrap your app with DndProvider */}
      <div style={{ display: 'flex' }}> {/* Flex container for sidebar and main content */}
        {/* Render Sidebar only if the current path is not in noSidebarPaths */}
        {!isLoginPage && <Sidebar />} {/* Sidebar on every page except login-related pages */}
        <div className={`content ${isLoginPage ? 'login-content' : ''}`}> {/* Main content area with class for styling */}
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/management/leads-pipeline" element={<LeadsPipeline />} /> {/* Add this line */}
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

