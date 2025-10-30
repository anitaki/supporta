import { useState } from 'react';
import { Box, TextField, Button, InputLabel, FormControl, Select, MenuItem, Typography, Divider, CircularProgress } from '@mui/material';
import { MuiColorInput } from 'mui-color-input';
import { Add, Upload, Edit, Delete } from '@mui/icons-material';

export default function CustomizationTab() {
  const defaultColor = 'rgba(101, 23, 171, 1)'; // will be business color from backend
  const [greeting, setGreeting] = useState('');
  const [color, setColor] = useState('rgba(101, 23, 171, 1)');
  const [font, setFont] = useState('Inter');
  const [icon, setIcon] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangeColor = (newValue) => {
    setColor(newValue);
  };

  const resetColor = () => {
    setColor(defaultColor);
  };

  const handleChangeFont = (e) => {
    setFont(e.target.value);
  };

  const handleSave = () => {
    setSaving(true);
    console.log('🚀 ~ CustomizationTab ~ greeting:', greeting);
    console.log('🚀 ~ CustomizationTab ~ color:', color);
    console.log('🚀 ~ CustomizationTab ~ font:', font);
    console.log('🚀 ~ CustomizationTab ~ icon:', icon);
    setSaving(false);
  };

  return (
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

      {/* Color selection */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Chat Button & Accent Color
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          This color defines the main theme of your chat widget — used for buttons, highlights, and icons.
        </Typography>
        <Box display="flex" gap={1} alignItems="center" mt={1}>
          <MuiColorInput format="rgb" value={color} onChange={handleChangeColor} />
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
          <Select labelId="font" value={font} onChange={handleChangeFont}>
            <MenuItem value="Inter">Inter</MenuItem>
            <MenuItem value="Poppins">Poppins</MenuItem>
            <MenuItem value="Roboto">Roboto</MenuItem>
            <MenuItem value="Open Sans">Open Sans</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider />

      {/* Icon upload */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Chat Icon
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Upload your business logo or any image that will appear as the chat assistant icon.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }} gap={2}>
          <Button variant="outlined" component="label" sx={{ borderRadius: 1 }}>
            <Upload /> Upload File
            <input type="file" hidden accept=".pdf,image/*" onChange={(e) => setIcon(e.target.files[0])} />
          </Button>
          <Typography mt={1}>{icon ? icon.name : 'No file selected'}</Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="flex-end" width="100%">
        <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ alignSelf: 'flex-end' }}>
          {saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save'}
        </Button>
      </Box>
    </Box>
  );
}
