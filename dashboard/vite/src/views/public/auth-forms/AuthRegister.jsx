import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
const API_URL = import.meta.env.VITE_API_URL;
import { CustomSnackbar } from '../../../ui-component/extended/Snackbar';
import { validateRegisterForm } from '../../../utils/authValidation';
import { strengthIndicator, strengthColor } from '../../../utils/password-strength';
import { useAuth } from '../../../contexts/AuthContext';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import { forwardRef } from 'react';

// ===========================|| JWT - REGISTER ||=========================== //

export default function AuthRegister() {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(true);
  const [errors, setErrors] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    username: '',
    businessName: ''
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = validateRegisterForm(formData);
    if (newErrors) return setErrors(newErrors);

    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData, { withCredentials: true });
      if (!res) throw new Error('Registration failed');

      setSnackbar({ open: true, severity: 'success', message: 'Registration successful.' });

      // Attempt login
      const success = await login(formData.email, formData.password);
      setErrors({});
      if (success) setTimeout(() => navigate('/dashboard'), 1500);
      else setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const fieldErrors = {};
      if (err?.response?.data?.errors) {
        err.response.data.errors.forEach((err) => {
          fieldErrors[err.path] = err.msg;
        });
      }
      setErrors(fieldErrors);
      console.log(fieldErrors);
      if (err.response && err.response.data?.msg) {
        setSnackbar({ open: true, severity: 'error', message: err.response.data.msg });
      } else {
        setSnackbar({ open: true, severity: 'error', message: 'Something went wrong. Please try again.' });
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container direction="column" spacing={2} sx={{ justifyContent: 'center' }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'center' }} size={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Sign up with Email address</Typography>
          </Box>
        </Grid>
      </Grid>
      <TextField
        fullWidth
        label="Business Name"
        margin="normal"
        name="businessName"
        type="text"
        value={formData.businessName}
        onChange={handleChange}
        sx={{ ...theme.typography.customInput }}
        error={!!errors.businessName}
        helperText={errors.businessName}
      />
      <Grid container spacing={{ xs: 0, sm: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="First Name"
            margin="normal"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            sx={{ ...theme.typography.customInput }}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Last Name"
            margin="normal"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            sx={{ ...theme.typography.customInput }}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />
        </Grid>
      </Grid>
      <TextField
        fullWidth
        label="username"
        margin="normal"
        name="username"
        type="text"
        value={formData.username}
        onChange={handleChange}
        sx={{ ...theme.typography.customInput }}
        error={!!errors.username}
        helperText={errors.username}
      />

      <FormControl fullWidth sx={{ ...theme.typography.customInput }} error={!!errors.email}>
        <InputLabel htmlFor="outlined-adornment-email-register">Email Address</InputLabel>
        <OutlinedInput id="outlined-adornment-email-register" type="email" value={formData.email} name="email" onChange={handleChange} />
        {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
      </FormControl>

      <FormControl fullWidth sx={{ ...theme.typography.customInput }} error={!!errors.password}>
        <InputLabel htmlFor="outlined-adornment-password-register">Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password-register"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          name="password"
          label="Password"
          onChange={handleChange}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="large"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
        {errors.password && (
          <FormHelperText>
            {/* Strength indicator */}
            {formData.password && (
              <FormHelperText sx={{ mb: errors.password ? 0 : 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: strengthColor(strengthIndicator(formData.password)).color,
                    fontWeight: 'bold'
                  }}
                >
                  Strength: {strengthColor(strengthIndicator(formData.password)).label}
                </Typography>
              </FormHelperText>
            )}

            {/* Validation error */}
            {errors.password && (
              <FormHelperText>
                <Typography variant="caption" sx={{ color: theme.palette.error.main }}>
                  {errors.password}
                </Typography>
              </FormHelperText>
            )}
          </FormHelperText>
        )}
      </FormControl>

      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid>
          <FormControlLabel
            control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />}
            label={
              <Typography variant="subtitle1">
                Agree with &nbsp;
                <Typography variant="subtitle1" component={Link} to="#">
                  Terms & Condition.
                </Typography>
              </Typography>
            }
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="secondary">
            Sign up
          </Button>
        </AnimateButton>
      </Box>
      <CustomSnackbar
        open={snackbar.open}
        autoHideDuration={5000}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Box>
  );
}
