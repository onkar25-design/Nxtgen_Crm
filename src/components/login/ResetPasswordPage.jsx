import React, { useState, useEffect } from 'react';
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
import './ResetPasswordPage.css'; // You can create this CSS file similar to ForgotPasswordPage.css

const theme = createTheme({
  palette: {
    primary: {
      main: '#388e3c',
    },
  },
});

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // The user has clicked the recovery link
        console.log('Password recovery initiated');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) throw error;

      setMessage('Password updated successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage(error.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="reset-password-container reset-password-page">
        <div className="reset-password-box reset-password-box-page">
          <img src={companyLogo} alt="Company Logo" className="company-logo reset-company-logo" />
          <Typography variant="h4" component="h1" className="page-title reset-page-title">
            Reset Password
          </Typography>
          <Box component="form" onSubmit={handleResetPassword} noValidate className="reset-password-form reset-form">
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="reset-password-input"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="reset-password-button reset-button"
            >
              Set New Password
            </Button>
            {message && (
              <Typography className="reset-message reset-message-page">
                {message}
              </Typography>
            )}
          </Box>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ResetPasswordPage;
