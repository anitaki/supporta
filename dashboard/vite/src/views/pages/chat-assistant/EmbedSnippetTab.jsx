import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { IconClipboardFilled, IconClipboardCheckFilled } from '@tabler/icons-react';
// import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function EmbedSnippetTab() {
  const [widgetToken, setWidgetToken] = useState(null);
  const [copied, setCopied] = useState(false);
  console.log('🚀 ~ EmbedSnippetTab ~ widgetToken:', widgetToken);

  const { api } = useAuth();

  const fetchWidgetToken = async () => {
    try {
      const res = await api.get('/business');
      console.log('res.data fetch: ', res.data);
      setWidgetToken(res.data.widgetToken);
    } catch (err) {
      console.log('Error fetching token: ', err);
    }
  };

  useEffect(() => {
    fetchWidgetToken();
  }, []);

  const snippet = `<script
src="https://supporta.onrender.com/widget.js"
data-widget-token=${widgetToken}
async
></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Embed Snippet
      </Typography>

      <Typography mb={1}>Copy and paste the following snippet into your website’s &lt;head&gt; tag:</Typography>

      <TextField
        multiline
        fullWidth
        value={snippet}
        minRows={6}
        InputProps={{
          sx: {
            fontFamily: 'monospace',
            bgcolor: '#f7f7f7'
          }
        }}
      />

      <Button
        variant="contained"
        startIcon={copied ? <IconClipboardCheckFilled /> : <IconClipboardFilled />}
        onClick={handleCopy}
        sx={{ mt: 2 }}
      >
        {copied ? 'Copied!' : 'Copy Snippet'}
      </Button>
    </Box>
  );
}
