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
import Swal from 'sweetalert2';

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

  const checkUserExists = async (email) => {
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (error) {
        console.error('Error checking user existence:', error);
        return { exists: false, error };
    }

    return { exists: !!data, error: null };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // Check if the user exists
    const { exists, error: checkError } = await checkUserExists(email);
    if (checkError) {
        Swal.fire({
            icon: 'error',
            title: 'User Not Registered',
            text: 'The email address you entered is not registered. Please sign up.',
        });
        return; // Exit if there's an error
    }
    if (!exists) {
        Swal.fire({
            icon: 'error',
            title: 'User Not Registered',
            text: 'The email address you entered is not registered. Please sign up.',
        });
        return; // Exit if the user is not registered
    }

    // Proceed with login
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // Check if the user exists in the database
            const { exists: userExists } = await checkUserExists(email);
            if (userExists) {
                // User exists but password is incorrect
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Credentials',
                    text: 'The password you entered is incorrect. Please try again.',
                });
            } else {
                // User does not exist
                Swal.fire({
                    icon: 'error',
                    title: 'User Not Registered',
                    text: 'The email address you entered is not registered. Please sign up.',
                });
            }
            return; // Exit the function if there's an error
        }

        // Fetch user details including name, role, and status
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('first_name, last_name, role, status')
            .eq('id', data.user.id)
            .single();

        if (userError) throw userError;

        // Log the fetched user data for debugging
        console.log("Fetched User Data:", userData);

        // Check if the user status is active
        if (userData.status !== 'active') {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'Your account is not approved yet. Please contact an administrator.',
            });
            await supabase.auth.signOut();
            return;
        }

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

