import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../../../supabaseClient";
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  CssBaseline,
  ThemeProvider,
  createTheme,
  Grid
} from '@mui/material';
import companyLogo from '../login/company-logo.png'; // Adjust the path as needed
import './SignupPage.css'; // Create this CSS file

const theme = createTheme({
  palette: {
    primary: {
      main: '#388e3c',
    },
  },
});

const SignupPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'staff' // Changed default role to 'staff'
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;

      if (data.user) {
        console.log('Sign-up initiated:', data.user);
        // Insert user details into the users table
        const { error: insertError } = await supabase
          .from('users') // Ensure this matches your table name
          .insert([
            {
              id: data.user.id, // Use the user's ID from Supabase
              email: data.user.email,
              role: 'staff', // Default role
              first_name: firstName,
              last_name: lastName
            }
          ]);

        if (insertError) throw insertError;

        setError('Please check your email to confirm your account before logging in.');
      }
    } catch (error) {
      console.error('Sign-up error:', error);
      setError(error.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="signup-container">
        <div className="signup-box">
          <img src={companyLogo} alt="Company Logo" className="company-logo" />
          <Box component="form" onSubmit={handleSignUp} noValidate className="signup-form">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="signup-button"
            >
              Sign Up
            </Button>
            {error && (
              <Typography className="signup-error">
                {error}
              </Typography>
            )}
            <Button
              onClick={() => navigate('/login')}
              fullWidth
              variant="text"
              className="back-to-login-button"
            >
              Back to Login
            </Button>
          </Box>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default SignupPage;