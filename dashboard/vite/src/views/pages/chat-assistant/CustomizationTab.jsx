import { useState, useEffect } from 'react';
import { Box, TextField, Button, InputLabel, FormControl, Select, MenuItem, Typography, Divider, CircularProgress } from '@mui/material';
import { MuiColorInput } from 'mui-color-input';
import { useAuth } from '../../../contexts/AuthContext';
import UploadLogo from './UploadLogo';
import { CustomSnackbar } from '../../../ui-component/extended/Snackbar';

export default function CustomizationTab() {
  const [greeting, setGreeting] = useState('');
  const [color, setColor] = useState('rgba(101, 23, 171, 1)');
  const [font, setFont] = useState('Inter');
  const [logo, setLogo] = useState('');
  const [theme, setTheme] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialSettings, setInitialSettings] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: ''
  });


  const { api } = useAuth();

  const fetchSettings = async () => {
    try {
      const res = await api.get('/business');
      console.log('res.data fetch: ', res.data);
      setGreeting(res.data.greeting);
      setColor(res.data.color);
      setFont(res.data.font);
      setTheme(res.data.theme);
      setLogo(res.data.logo);
      setInitialSettings(res.data);
    } catch (err) {
      console.log('Error fetching settings: ', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const resetColor = () => {
    setColor(initialSettings.color);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('color', color);
      formData.append('theme', theme);
      formData.append('font', font);
      formData.append('greeting', greeting);

      // Only append file if a new one is selected
      if (logo instanceof File) {
        formData.append('file', logo); // must match multer.single('file')
      }

      const res = await api.patch('/business', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update states with response
      setGreeting(res.data.greeting);
      setColor(res.data.color);
      setFont(res.data.font);
      setTheme(res.data.theme);
      setLogo(res.data.logo);
      setInitialSettings(res.data);
      setSnackbar({ open: true, severity: 'success', message: 'Your settings were saved successfully' });
    } catch (err) {
      console.error('Error saving settings:', err);
      setSnackbar({ open: true, severity: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!initialSettings) return;

    setGreeting(initialSettings.greeting);
    setColor(initialSettings.color);
    setFont(initialSettings.font);
    setTheme(initialSettings.theme);
    setLogo(initialSettings.logo);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <form onSubmit={handleSave} style={{ marginTop: '45px' }}>
      <Box my={3} display="flex" flexDirection="column" gap={4}>
        {/* Greeting message */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Greeting Message
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            This message appears at the start of each new chat session — for example: “Hi! How can I help you today?”
          </Typography>
          <TextField
            fullWidth
            label="Greeting message"
            margin="normal"
            multiline
            rows={3}
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
          />
        </Box>

        <Divider />

        {/* Theme selection */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Chat Theme
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Choose the theme for your chat widget. Auto will follow the user’s system preference.
          </Typography>
          <FormControl variant="standard" sx={{ minWidth: 200 }}>
            <InputLabel id="theme">Theme</InputLabel>
            <Select
              labelId="theme"
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value);
              }}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="auto">Auto</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider />

        {/* Color selection */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Chat Button & Accent Color
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            This color defines the main theme of your chat widget — used for buttons, highlights, and icons.
          </Typography>
          <Box display="flex" gap={1} alignItems="center" mt={1}>
            <MuiColorInput
              format="rgb"
              value={color}
              onChange={(newColor) => {
                setColor(newColor);
              }}
            />
            <Button onClick={resetColor}>Reset</Button>
          </Box>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Current color: <span style={{ fontWeight: 500 }}>{color}</span>
          </Typography>
        </Box>

        <Divider />

        {/* Font selection */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Chat Font
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Choose the font that will be used throughout your chat interface.
          </Typography>
          <FormControl variant="standard" sx={{ minWidth: 200 }}>
            <InputLabel id="font">Font</InputLabel>
            <Select labelId="font" value={font} onChange={(e) => setFont(e.target.value)}>
              <MenuItem value="Inter">Inter</MenuItem>
              <MenuItem value="Poppins">Poppins</MenuItem>
              <MenuItem value="Roboto">Roboto</MenuItem>
              <MenuItem value="Open Sans">Open Sans</MenuItem>
              <MenuItem value="Times New Roman">Times New Roman</MenuItem>
              <MenuItem value="cursive">Cursive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider />

        {/* Logo upload */}
        <UploadLogo logo={logo} setLogo={setLogo} uploading={uploading} color={color} setUploading={setUploading} />

        {/* Cancel and Save button */}
        <Box display="flex" justifyContent="flex-end" width="100%" gap={1}>
          <Button onClick={handleCancel} sx={{ alignSelf: 'flex-end' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ alignSelf: 'flex-end' }}>
            {saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save'}
          </Button>
        </Box>
      </Box>
      <CustomSnackbar
        open={snackbar.open}
        autoHideDuration={6000}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </form>
  );
}
