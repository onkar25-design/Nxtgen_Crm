import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../../../supabaseClient";
import { 
  TextField, 
  Button, 
  Box, 
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import Swal from 'sweetalert2';
import './ResetPasswordPage.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7fba00',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery initiated');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      Swal.fire({
        icon: 'error',
        title: 'Session Expired',
        text: 'You need to be logged in to reset your password. Redirecting to login...',
      });
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be at least 8 characters long and include at least one special character.',
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Password updated successfully. Redirecting to login...',
      });

      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message,
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="reset-password-container">
        <div className="reset-password-box">
          <div className="reset-password-company-logo">
            <h1 className="reset-password-logo-title"><span>Nxt</span><span>Gen</span></h1>
          </div>
          <Box component="form" onSubmit={handleResetPassword} noValidate className="reset-password-form">
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
              className="reset-password-button"
            >
              Set New Password
            </Button>
          </Box>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ResetPasswordPage;
