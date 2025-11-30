import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../../contexts/AuthContext';

export default function ChatHistoryTab() {
  const { api } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [widgetToken, setWidgetToken] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

  useEffect(() => {
    fetchWidgetToken();
  }, []);
  useEffect(() => {
    if (widgetToken) fetchHistory();
  }, [widgetToken]);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const aTime = a.messages[0]?.timestamp ? new Date(a.messages[0].timestamp).getTime() : 0;
      const bTime = b.messages[0]?.timestamp ? new Date(b.messages[0].timestamp).getTime() : 0;
      return sortAsc ? aTime - bTime : bTime - aTime;
    });
  }, [history, sortAsc]);

  if (loading) return <CircularProgress />;
  if (!history.length) return <Typography>No chat history available.</Typography>;

  const handleAccordionChange = (id) => (e, isExpanded) => setExpanded(isExpanded ? id : false);

  return (
    <Box>
      <Button onClick={() => setSortAsc(!sortAsc)} sx={{ mb: 2 }}>
        Sort {sortAsc ? 'Oldest → Newest' : 'Newest → Oldest'}
      </Button>

      {sortedHistory.map((conv) => {
        const createdAt = conv.messages[0]?.timestamp || Date.now();
        return (
          <Accordion
            key={conv.conversationId + sortAsc} // force rerender on sort
            expanded={expanded === conv.conversationId}
            onChange={handleAccordionChange(conv.conversationId)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ color: 'rgb(103, 58, 183)' }}>
                {`Session with User - ${new Date(createdAt).toLocaleString()}`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {conv.messages.map((msg, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <strong>{msg.role}:</strong>
                  <ReactMarkdown
                    components={{
                      img: ({ node, ...props }) => (
                        <img {...props} style={{ maxWidth: 150, maxHeight: 150, display: 'block', marginTop: 5 }} />
                      )
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
