import { useState } from 'react';
import { Tabs, Tab, Typography, Box, Card, CardContent } from '@mui/material';
import CustomizationTab from './CustomizationTab';
import EmbedSnippetTab from './EmbedSnippetTab';
import ChatHistoryTab from './ChatHistoryTab';

export default function ChatAssistant() {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('chatAssistantActiveTab');
    return savedTab !== null ? parseInt(savedTab, 10) : 0;
  });

  const handleChange = (event, value) => {
    setActiveTab(value);
      localStorage.setItem('chatAssistantActiveTab', value);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={600}>
          Chat Assistant Management
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={handleChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tab label="Customization" />
            <Tab label="Embed Snippet" />
            <Tab label="Chat History" />
          </Tabs>
          {activeTab === 0 && <CustomizationTab />}
          {activeTab === 1 && <EmbedSnippetTab />}
          {activeTab === 2 && <ChatHistoryTab />}
        </CardContent>
      </Card>
    </Box>
  );
}
