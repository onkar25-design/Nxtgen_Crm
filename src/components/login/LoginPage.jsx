import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from "../../../supabaseClient";
import bcrypt from 'bcryptjs';
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

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      console.log('Attempting to log in with email:', email);

      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      console.log('Query result:', { user, fetchError });

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('User not found');
        } else {
          throw fetchError;
        }
        return;
      }

      if (!user) {
        setError('User not found');
        return;
      }

      // Compare the provided password with the stored hash
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        setError('Invalid password');
        return;
      }

      console.log('Login successful:', user);

      switch(user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'staff':
          navigate('/staff');
          break;
        case 'client':
          navigate('/customer');
          break;
        default:
          setError('Invalid user role');
      }

    } catch (error) {
      console.error('Login error:', error);
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
            <Button
              component={Link}
              to="/signup"
              fullWidth
              variant="outlined"
              className="signup-button"
            >
              Create an Account
            </Button>
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