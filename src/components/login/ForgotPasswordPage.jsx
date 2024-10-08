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
  createTheme
} from '@mui/material';
import companyLogo from './company-logo.png';
import './ForgotPasswordPage.css'; // Create this CSS file if needed

const theme = createTheme({
  palette: {
    primary: {
      main: '#388e3c',
    },
  },
});

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage(error.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          <img src={companyLogo} alt="Company Logo" className="company-logo" />
          <Typography variant="h4" component="h1" className="page-title">
            Forgot Password
          </Typography>
          <Box component="form" onSubmit={handleResetPassword} noValidate className="forgot-password-form">
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="reset-password-button"
            >
              Reset Password
            </Button>
            <Button
              onClick={() => navigate('/login')}
              fullWidth
              variant="text"
              className="back-to-login-button"
            >
              Back to Login
            </Button>
            {message && (
              <Typography className="reset-message">
                {message}
              </Typography>
            )}
          </Box>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ForgotPasswordPage;
