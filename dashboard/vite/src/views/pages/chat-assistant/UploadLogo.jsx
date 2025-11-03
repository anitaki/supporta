import { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { Upload } from '@mui/icons-material';

export default function UploadLogo({ logo, setLogo, uploading, color }) {
  const [preview, setPreview] = useState(null);

  // Create preview for local files or use backend URL
  useEffect(() => {
    if (logo instanceof File) {
      const objectUrl = URL.createObjectURL(logo);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof logo === 'string' && logo.startsWith('http')) {
      setPreview(logo);
    } else {
      setPreview(null);
    }
  }, [logo]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Chat Icon
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={1}>
        Upload your business logo or any image that will appear as the chat assistant icon.
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center' }} gap={2}>
        {preview && (
          <Box
            component="img"
            src={preview}
            alt="widget logo"
            sx={{
              width: 50,
              height: 50,
              padding: '5px',
              objectFit: 'cover',
              border: '1px solid #ddd',
              borderRadius: '50%',
              backgroundColor: color
            }}
          />
        )}

        <Button variant="outlined" component="label" sx={{ borderRadius: 1 }}>
          <Upload sx={{ mr: 1 }} />
          {uploading ? <CircularProgress size={20} sx={{ color: 'info.main' }} /> : 'Upload File'}
          <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
        </Button>

        <Typography mt={1}>{logo ? (typeof logo === 'string' ? logo.split('/').pop() : logo.name) : 'No file selected'}</Typography>
      </Box>
    </Box>
  );
}
