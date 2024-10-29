import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from "../../../supabaseClient";
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import companyLogo from './company-logo.png'; // Adjust the path as needed
import './LoginPage.css'; // Import the CSS file

const theme = createTheme({
  palette: {
    primary: {
      main: '#388e3c',
    },
  },
});

const LoginPage = ({ setUserName, setUserRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user details including name and role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name, role') // Fetch first and last name and role
        .eq('id', data.user.id)
        .single();

      if (userError) throw userError;

      // Set user name and role in the parent component
      const fullName = `${userData.first_name} ${userData.last_name}`;
      setUserName(fullName);
      setUserRole(userData.role);

      // Store user name and role in localStorage
      localStorage.setItem('userName', fullName);
      localStorage.setItem('userRole', userData.role);

      navigate('/dashboard'); // Redirect to dashboard or desired page
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="login-container">
        <div className="login-box">
          <img src={companyLogo} alt="Company Logo" className="company-logo" />
          <Box component="form" onSubmit={handleLogin} noValidate className="login-form">
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="login-button"
            >
              Sign In
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
              <Link to="/signup" className="signup-link">
                Create an Account
              </Link>
            </Box>
            {error && (
              <Typography className="login-error">
                {error}
              </Typography>
            )}
          </Box>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default LoginPage;

