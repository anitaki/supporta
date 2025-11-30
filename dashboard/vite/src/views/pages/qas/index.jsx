import { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../../contexts/AuthContext';

export default function ChatHistoryTab() {
  const { api } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [widgetToken, setWidgetToken] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null); // for accordion expansion

  const fetchWidgetToken = async () => {
    try {
      const res = await api.get('/business');
      setWidgetToken(res.data.widgetToken);
    } catch (err) {
      console.log('Error fetching token: ', err);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/message/all', {
        headers: { 'x-widget-token': widgetToken }
      });
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWidgetToken(); }, []);
  useEffect(() => { if (widgetToken) fetchHistory(); }, [widgetToken]);

  if (loading) return <CircularProgress />;
  if (history.length === 0) return <Typography>No chat history available.</Typography>;

  const columns = [
    {
      field: 'session',
      headerName: 'Session',
      flex: 1,
      renderCell: (params) => {
        const createdAt = params.row.messages[0]?.timestamp || Date.now();
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() =>
              setExpandedRow(expandedRow === params.row.conversationId ? null : params.row.conversationId)
            }
          >
            <ExpandMoreIcon
              sx={{
                transform: expandedRow === params.row.conversationId ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
            <Typography sx={{ ml: 1, color: 'rgb(103, 58, 183)' }}>
              {`Session with User - ${new Date(createdAt).toLocaleString()}`}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'conversation',
      headerName: 'Conversation',
      flex: 2,
      renderCell: (params) => {
        if (expandedRow !== params.row.conversationId) return null;
        return (
          <Box sx={{ width: '100%' }}>
            {params.row.messages.map((msg, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <strong>{msg.role}:</strong>
                <ReactMarkdown
                  components={{
                    img: ({ node, ...props }) => (
                      <img
                        {...props}
                        style={{ maxWidth: 150, maxHeight: 150, display: 'block', marginTop: 5 }}
                      />
                    )
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </Box>
            ))}
          </Box>
        );
      }
    }
  ];

  const rows = history.map((conv) => ({
    id: conv.conversationId,
    conversationId: conv.conversationId,
    messages: conv.messages
  }));

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableSelectionOnClick
        autoHeight
        pageSize={10}
      />
    </Box>
  );
}
