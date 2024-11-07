import React, { useState } from 'react';
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
import Swal from 'sweetalert2'; // Import SweetAlert2
import './ForgotPasswordPage.css'; // Create this CSS file if needed

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4CAF50',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
        // Check if the email is registered
        const { data, error: fetchError } = await supabase
            .from('users')
            .select('email, status') // Fetch status along with email
            .eq('email', email)
            .single();

        if (fetchError) {
            // Handle specific fetch errors
            if (fetchError.code === 'PGRST116') { // Example error code for no rows found
                Swal.fire({
                    icon: 'error',
                    title: 'Email Not Registered',
                    text: 'This email is not registered. Please check and try again.',
                });
                return;
            }
            throw fetchError; // Throw other fetch errors
        }

        if (!data || data.status !== 'active') { // Check if user is not active
            Swal.fire({
                icon: 'error',
                title: 'Email Not Registered',
                text: 'This email is not registered or not active. Please check and try again.',
            });
            return;
        }

        // Update the redirect URL to your Netlify site
        const netlifyRedirectUrl = 'https://nxtgencrm.netlify.app/reset-password'; // Use your actual Netlify URL

        // Proceed to send the password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: netlifyRedirectUrl,
        });

        if (error) throw error;

        Swal.fire({
            icon: 'success',
            title: 'Email Sent',
            text: 'Password reset email sent. Please check your inbox.',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while trying to reset the password. Please try again later.',
        });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          <div className="forgot-password-company-logo">
            <h1 className="forgot-password-logo-title"><span>Nxt</span><span>Gen</span></h1>
          </div>
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
              className="forgot-password-reset-button"
            >
              Reset Password
            </Button>
            <Button
              onClick={() => navigate('/login')}
              fullWidth
              variant="text"
              className="forgot-password-back-to-login-button"
            >
              Back to Login
            </Button>
          </Box>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ForgotPasswordPage;
